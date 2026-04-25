from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from app.core.schema import SchemaDefinition, ValidationResult, SingleTableSchemaDefinition
from app.core.pipeline import DataPipeline
from app.generators import registry
from app.core.relational_generator import RelationalGenerator
from app.core.export_service import export_service
from app.core.templates import get_templates
from app.core.scenarios import get_scenarios
from typing import Any, List, Dict, Optional
import os
import io
import json
import uuid
from google import genai
from pydantic import BaseModel
import traceback
from app.core.experiment_service import experiment_service
from app.core.impact_analysis_service import impact_analysis_service
from app.core.tuning_expert_service import tuning_expert_service
from app.core.feature_analysis_service import feature_analysis_service
from app.core.experiment_design_service import experiment_design_service
from app.core.coaching_service import coaching_service
from app.core.causality_service import causality_service
from app.core.learning_assistant_service import learning_assistant_service

router = APIRouter()
pipeline = DataPipeline(registry)
relational_gen = RelationalGenerator(pipeline)


def push_to_pipelines(df, schema_name: str, row_count: int):
    """Background task to upload to all active outputs based on config (hardcoded to Supabase for now)"""
    export_service.log_pipeline_execution(f"Generation start: {row_count} rows.", schema_name, "started")
    
    try:
        csv_bytes = export_service.to_csv(df)
        file_url = export_service.upload_to_supabase(csv_bytes, f"{schema_name}.csv", "outputs")
        
        if file_url:
            export_service.log_pipeline_execution(
                f"Generated {row_count} rows -> Supabase Storage (outputs) ?", schema_name, "success"
            )
        else:
            export_service.log_pipeline_execution(
                f"Generated {row_count} rows -> Pipeline Error (failed upload)", schema_name, "error"
            )
    except Exception as e:
        export_service.log_pipeline_execution(f"Pipeline flow error: {str(e)}", schema_name, "error")


@router.get("/generators")
async def list_generators():
    return registry.list_generators()

@router.get("/templates")
async def list_templates():
    return get_templates()

@router.get("/scenarios")
async def list_scenarios():
    return get_scenarios()

@router.post("/schema/validate")
async def validate_schema(schema: SchemaDefinition):
    errors = []
    if hasattr(schema, "tables"):
        for table in schema.tables:
            for field in table.fields:
                gen = registry.get_generator(field.type)
                if not gen:
                    errors.append(f"Generator for type '{field.type}' not found")
    return ValidationResult(is_valid=len(errors) == 0, errors=errors)

@router.post("/schema/preview")
async def preview_schema(schema: SingleTableSchemaDefinition):
    try:
        schema.row_count = 10
        df, report = pipeline.run(schema)
        return {
            "data": df.to_dict(orient="records"),
            "report": report
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
async def generate_data(schema: SingleTableSchemaDefinition, background_tasks: BackgroundTasks):
    try:
        df, report = pipeline.run(schema)
        
        # Fire off the pipeline sync to Supabase invisibly in the background
        background_tasks.add_task(push_to_pipelines, df, "default", schema.row_count)
        
        return {
            "data": df.to_dict(orient="records"),
            "report": report,
            "message": "Data generated and pipelined to active destinations."
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate/multi")
async def generate_multi_table(schema: SchemaDefinition, background_tasks: BackgroundTasks):
    try:
        results, reports = relational_gen.generate(schema)
        
        # In a multi-table scenario, upload a ZIP to Supabase
        def push_multi_pipeline(data_dict, row_info: str):
            export_service.log_pipeline_execution(f"Multi-table generation start: {row_info} rows.", "multi_schema", "started")
            try:
                zip_bytes = export_service.to_zip(data_dict)
                file_url = export_service.upload_to_supabase(zip_bytes, "multi_table_export.zip", "outputs")
                if file_url:
                    export_service.log_pipeline_execution(
                        f"Generated zip -> Supabase Storage (outputs) ?", "multi_schema", "success"
                    )
            except Exception as e:
                export_service.log_pipeline_execution(f"Multi-table pipeline error: {str(e)}", "multi_schema", "error")
        
        total_rows = sum([len(df) for df in results.values()])
        background_tasks.add_task(push_multi_pipeline, results, str(total_rows))
        
        return {
            "data": {name: df.to_dict(orient="records") for name, df in results.items()},
            "reports": reports,
            "message": "Multi-table data generated and pipelined to active destinations."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AIPromptRequest(BaseModel):
    prompt: str

class AnalyzeRequest(BaseModel):
    schema_def: dict
    data: list

class ExperimentRecommendRequest(BaseModel):
    schema_def: dict

class TrainRequest(BaseModel):
    data: list
    target_column: str
    model_type: str

class ExplainRequest(BaseModel):
    metrics: dict
    model_info: dict
    schema_def: dict

class SuggestSemanticsRequest(BaseModel):
    schema_def: dict

class MentorRequest(BaseModel):
    data: list
    schema_def: dict

class TimeSeriesPatternRequest(BaseModel):
    requirement: str

class CompareRequest(BaseModel):
    v1_data: list
    v2_data: list
    schema_def: dict

class NotebookExportRequest(BaseModel):
    data: list
    target_column: Optional[str] = None

class CompareModelsRequest(BaseModel):
    data: list
    target_column: str
    problem_type: str # classification or regression

class ImpactAnalysisRequest(BaseModel):
    dataset_a: list
    dataset_b: list
    metrics_a: dict
    metrics_b: dict
    schema_def: dict

class TuningExpertRequest(BaseModel):
    model_type: str
    current_params: dict
    current_metrics: dict

class FeatureAnalysisRequest(BaseModel):
    model_type: str
    schema_def: dict
    importance_scores: dict

class StressTestRequest(BaseModel):
    data: list
    target_column: str
    model_type: str
    schema_def: dict

class CoachingRequest(BaseModel):
    issues_found: list
    metrics: dict
    problem_type: str

class CausalityRequest(BaseModel):
    characteristic: str
    metric_changes: str

class LearningAssistantRequest(BaseModel):
    experiment_type: str
    results_data: dict
    student_profile: dict

@router.post("/ai/analyze")
async def ai_analyze_data(request: AnalyzeRequest):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in backend environment")
    
    try:
        client = genai.Client(api_key=api_key)
        
        
        system_prompt = """
        You are a data analyst AI and visualization expert. Analyze the following dataset schema and sample data.
        
        Your task:
        1. Summarize each column:
           - Data type
           - Distribution type (normal, skewed, uniform, categorical imbalance)
           - Unique values count
           - Missing value percentage
        2. Identify:
           - Highly skewed features
           - Low variance columns
           - Potential outliers
           - Class imbalance (if target exists)
        3. Suggest:
           - Which columns are useful for ML
           - Which columns may need transformation (normalization, encoding)
        4. Recommend Visualizations:
           - For each column, recommend the best chart type (histogram, boxplot, bar, area)
           - Explain why it is the best fit for that specific data distribution.

        Return output in structured JSON exactly matching this format:
        {
          "columns": [
            {
               "name": "col_name",
               "type": "string/number/etc",
               "distribution": "uniform/skewed/etc",
               "unique_count": 10,
               "missing_percentage": 0.0,
               "recommended_viz": {
                 "chart": "histogram/bar/area/box",
                 "reason": "to detect skewness..."
               }
            }
          ],
          "issues": [
            { "type": "skew", "column": "col_name", "description": "Highly skewed" }
          ],
          "recommendations": [
            { "column": "col_name", "action": "normalize", "reason": "Due to skewness" }
          ]
        }
        """
        
        sample_data = request.data[:100] # Send up to 100 rows
        prompt_content = f"{system_prompt}\n\nSchema:\n{json.dumps(request.schema_def)}\n\nSample Data:\n{json.dumps(sample_data)}"
        
        response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt_content)
        text = response.text
        
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        analysis = json.loads(text)
        return analysis
    except Exception as e:
        print(f"AI Analysis Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/experiment/recommend")
async def ai_experiment_recommend(request: ExperimentRecommendRequest):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in backend environment")
    
    try:
        client = genai.Client(api_key=api_key)
        
        
        system_prompt = """
        You are an ML expert. Given a dataset schema, recommend:
        1. Problem type (Classification, Regression, or Clustering)
        2. Suitable models (Logistic Regression, Decision Tree, Linear Regression, etc.)
        3. Explain why each model fits and expected behavior with noise.

        Return output in structured JSON:
        {
          "problem_type": "Classification",
          "target_suggestion": "column_name",
          "recommended_models": [
            { "name": "Logistic Regression", "type": "logistic_regression" },
            { "name": "Decision Tree", "type": "decision_tree_classifier" }
          ],
          "explanations": [
            { "model": "Logistic Regression", "text": "..." }
          ]
        }
        """
        
        response = client.models.generate_content(model='gemini-2.5-flash', contents=f"{system_prompt}\n\nSchema:\n{json.dumps(request.schema_def)}")
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/experiment/train")
async def ai_experiment_train(request: TrainRequest):
    try:
        result = experiment_service.train_model(
            data=request.data,
            target_column=request.target_column,
            model_type=request.model_type
        )
        return result
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/experiment/compare")
async def ai_experiment_compare(request: CompareModelsRequest):
    try:
        results = experiment_service.compare_models(
            data=request.data,
            target_column=request.target_column,
            problem_type=request.problem_type
        )
        return results
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/experiment/overfitting")
async def run_overfitting_experiment():
    try:
        return experiment_service.run_overfitting_experiment()
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class CorrelationExperimentRequest(BaseModel):
    model_type: str

@router.post("/ai/experiment/correlation")
async def run_correlation_experiment(request: CorrelationExperimentRequest):
    try:
        return experiment_service.run_correlation_experiment(request.model_type)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/coach")
async def ai_coach(request: CoachingRequest):
    try:
        return coaching_service.get_coaching(
            issues_found=request.issues_found,
            metrics=request.metrics,
            problem_type=request.problem_type
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/causality")
async def ai_causality(request: CausalityRequest):
    try:
        return causality_service.explain_causality(
            characteristic=request.characteristic,
            metric_changes=request.metric_changes
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/learning-assistant")
async def ai_learning_assistant(request: LearningAssistantRequest):
    try:
        return learning_assistant_service.explain_to_student(
            experiment_type=request.experiment_type,
            results_data=request.results_data,
            student_profile=request.student_profile
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/experiment/explain")
async def ai_experiment_explain(request: ExplainRequest):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in backend environment")
    
    try:
        client = genai.Client(api_key=api_key)
        
        
        system_prompt = """
        You are a model evaluation expert.
        Your task is to analyze model training results and provide deep insights.

        Task:
        1. Explain each metric (Accuracy, Precision, Recall, F1, ROC-AUC or MAE, MSE, RMSE, R2) in plain English (1-2 sentences).
        2. Provide a real-world interpretation for each metric (is this good or bad?).
        3. Flag misleading metrics (e.g., high accuracy on imbalanced data).
        4. Analyze the Confusion Matrix (if provided) to identify where the model is failing (e.g., high False Positives).
        5. Suggest specific data quality or architecture improvements.

        Output ONLY structured JSON:
        {
          "summary": "overall evaluation summary",
          "metrics_evaluation": [
            {
              "metric": "name",
              "value": number,
              "explanation": "what this means and why it matters",
              "interpretation": "is this good or bad?",
              "when_to_use": "when is this metric most relevant?"
            }
          ],
          "diagnosis": [
            { "issue": "name", "description": "...", "severity": "high|medium|low" }
          ],
          "metric_recommendations": [
            "Use Precision/Recall for imbalanced data",
            "Use ROC-AUC for threshold selection"
          ],
          "improvement_plan": ["step 1", "step 2"]
        }
        """
        
        context = {
            "metrics": request.metrics,
            "model_info": request.model_info,
            "schema_def": request.schema_def
        }
        
        response = client.models.generate_content(model='gemini-2.5-flash', contents=f"{system_prompt}\n\nContext:\n{json.dumps(context)}")
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/suggest-semantics")
async def ai_suggest_semantics(request: SuggestSemanticsRequest):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in backend environment")
    
    try:
        client = genai.Client(api_key=api_key)
        
        
        system_prompt = """
        You are a data modeling expert. Given a dataset schema, generate logical constraints and realistic correlations.

        Rules:
        1. Constraints: e.g., "age > 18", "order_date > signup_date".
        2. Correlations: e.g., "income" vs "spending" (positive, strong).

        Return output in structured JSON:
        {
          "constraints": [
            { "rule": "age > 18", "type": "numeric" },
            { "rule": "end_date > start_date", "type": "temporal" }
          ],
          "correlations": [
            { "feature_1": "income", "feature_2": "spending", "type": "positive", "strength": "strong" }
          ]
        }
        """
        
        response = client.models.generate_content(model='gemini-2.5-flash', contents=f"{system_prompt}\n\nSchema:\n{json.dumps(request.schema_def)}")
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/mentor")
async def ai_mentor_evaluation(request: MentorRequest):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in backend environment")
    
    try:
        df = pd.DataFrame(request.data)
        
        # Calculate deep stats to guide the AI
        stats = {}
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        for col in df.columns:
            if col in numeric_cols:
                stats[col] = {
                    "var": float(df[col].var()),
                    "skew": float(df[col].skew()),
                    "missing_pct": float(df[col].isna().mean() * 100)
                }
            else:
                counts = df[col].value_counts(normalize=True)
                stats[col] = {
                    "uniques": int(df[col].nunique()),
                    "imbalance_ratio": float(counts.iloc[0]) if not counts.empty else 0,
                    "missing_pct": float(df[col].isna().mean() * 100)
                }
        
        # Multicollinearity check
        correlations = []
        if len(numeric_cols) > 1:
            corr_matrix = df[numeric_cols].corr()
            for i in range(len(numeric_cols)):
                for j in range(i + 1, len(numeric_cols)):
                    val = corr_matrix.iloc[i, j]
                    if abs(val) > 0.8:
                        correlations.append({
                            "f1": numeric_cols[i],
                            "f2": numeric_cols[j],
                            "value": float(val)
                        })

        client = genai.Client(api_key=api_key)
        
        
        system_prompt = """
        You are a Senior Data Scientist and ML Mentor. Critically evaluate the provided dataset metrics and schema.
        
        Your task:
        1. Identify Data Quality Issues (Outliers, noise levels, missing patterns).
        2. Evaluate Feature Usefulness (Low variance, high redundancy).
        3. Detect Leakage Risks (Columns that might reveal the target unfairly).
        4. Assess ML Readiness (Imbalance, scaling needs, categorical encoding complexity).
        5. Multicollinearity: Check for redundant features that might confuse linear models.

        Return output in structured JSON:
        {
          "overall_health_score": 0-100,
          "critical_findings": [
            { "issue": "Target Leakage", "severity": "high", "description": "...", "fix": "..." }
          ],
          "feature_redundancy": [
            { "features": ["f1", "f2"], "reason": "High correlation", "suggestion": "..." }
          ],
          "mentor_advice": "A paragraph of expert strategic advice."
        }
        """
        
        context = {
            "stats": stats,
            "correlations": correlations,
            "schema": request.schema_def
        }
        
        response = client.models.generate_content(model='gemini-2.5-flash', contents=f"{system_prompt}\n\nDataset Stats:\n{json.dumps(context)}")
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/generate-schema")
async def ai_generate_schema(request: AIPromptRequest):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in backend environment")
    
    try:
        client = genai.Client(api_key=api_key)
        
        
        generators = registry.list_generators()
        # Create a detailed list of generators for context
        gen_context = []
        for name, info in generators.items():
            gen_context.append(f"- {name}: {info.get('description', '')}")
            
        system_prompt = f"""
        You are an expert data architect. Generate a complex synthetic data schema based on the user's prompt.
        Available generator types:
        {chr(10).join(gen_context)}
        
        Return ONLY a JSON object with this exact structure:
        {{
          "tables": [
            {{
              "id": "unique-uuid",
              "name": "TableName",
              "fields": [
                {{
                  "id": "field-uuid",
                  "name": "fieldName",
                  "type": "generator_type",
                  "config": {{}}
                }}
              ]
            }}
          ],
          "relationships": [
            {{
              "id": "rel-uuid",
              "parent_table": "table-uuid",
              "parent_pk": "field-name",
              "child_table": "table-uuid",
              "child_fk": "field-name"
            }}
          ]
        }}
        
        Rules:
        1. Use UUIDs for all IDs.
        2. Always include an 'id' field in every table (usually type 'uuid' or 'auto_increment').
        3. Table names should be PascalCase. Field names should be snake_case.
        4. Match field types to available generators. If unsure, use 'word' or 'text_pattern'.
        5. Create logical relationships between tables if requested.
        """
        
        response = client.models.generate_content(model='gemini-2.5-flash', contents=f"{system_prompt}\n\nUser Request: {request.prompt}")
        text = response.text
        
        # Extract JSON from markdown if present
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        schema = json.loads(text)
        return schema
    except Exception as e:
        print(f"AI Generation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/suggest-timeseries")
async def ai_suggest_timeseries(request: TimeSeriesPatternRequest):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in backend environment")
    
    try:
        client = genai.Client(api_key=api_key)
        
        
        system_prompt = """
        You are a Time-Series Expert. Generate a complex data pattern for a synthetic dataset.
        
        The user will describe what they want to simulate (e.g., 'stock market prices', 'heart rate sensor', 'retail sales').
        
        Your output must be a structured JSON explaining the pattern:
        {
          "trend": "Increasing/Decreasing/Flat/Drift description",
          "seasonality": "Daily/Weekly/Monthly cycles description",
          "noise": "High/Low/White description",
          "anomalies": [
             { "type": "spike/dip/drift", "description": "Why and when it happens" }
          ],
          "suggested_config": {
             "trend": 0.05,
             "seasonality_period": 24,
             "seasonality_amplitude": 10,
             "noise_level": 2,
             "anomaly_rate": 0.01
          }
        }
        """
        
        response = client.models.generate_content(model='gemini-2.5-flash', contents=f"{system_prompt}\n\nUser Requirement: {request.requirement}")
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/compare")
async def ai_compare_versions(request: CompareRequest):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in backend environment")
    
    try:
        df1 = pd.DataFrame(request.v1_data)
        df2 = pd.DataFrame(request.v2_data)
        
        # Calculate diff stats
        diffs = {}
        for col in df1.columns:
            if col in df2.columns:
                m1 = df1[col].isna().mean()
                m2 = df2[col].isna().mean()
                
                diffs[col] = {
                    "missing_delta": float(m2 - m1),
                }
                
                if np.issubdtype(df1[col].dtype, np.number):
                    diffs[col]["mean_delta"] = float(df2[col].mean() - df1[col].mean())
                    diffs[col]["std_delta"] = float(df2[col].std() - df1[col].std())

        client = genai.Client(api_key=api_key)
        
        
        system_prompt = """
        You are a Data Versioning Expert. Compare two versions of the same dataset.
        
        Highlight:
        1. Distribution Changes: (e.g., "Feature X is now more skewed").
        2. Missing Value Deltas: (e.g., "Missingness increased by 10%").
        3. Feature Drift: (e.g., "Mean of Y shifted significantly").
        
        Explain the "Impact on ML":
        - How will this change affect model accuracy/stability?
        - Does it introduce new bias or data quality risks?

        Return output in structured JSON:
        {
          "differences": [
            { "column": "col", "change": "...", "severity": "low/med/high" }
          ],
          "impact_on_ml": [
            { "aspect": "Generalization", "description": "...", "risk": "..." }
          ],
          "version_summary": "Short paragraph summary"
        }
        """
        
        response = client.models.generate_content(model='gemini-2.5-flash', contents=f"{system_prompt}\n\nComparison Stats:\n{json.dumps(diffs)}")
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SuggestDistributionRequest(BaseModel):
    column_definition: dict

@router.post("/ai/suggest-distribution")
async def ai_suggest_distribution(request: SuggestDistributionRequest):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in backend environment")
    
    try:
        client = genai.Client(api_key=api_key)
        
        
        system_prompt = """
        You are a statistical data generation expert.
        Given a column definition, your task is to:
        1. Determine the best statistical distribution based on:
           - Column type
           - User-specified distribution (if any)
           - Realistic constraints (min, max)
        2. Generate distribution parameters:
           - Uniform: min, max
           - Normal: mean, std_dev
           - Skewed: direction (left/right), skewness_factor (0-1)
           - Exponential: lambda
           - Custom: describe the pattern
        3. Output generation strategy

        Format your response as structured JSON:
        {
          "column_name": "...",
          "distribution_type": "...",
          "parameters": {
            "param1": value1,
            "param2": value2
          },
          "sample_preview": [list of 10 example values],
          "statistics": {
            "mean": ...,
            "std": ...,
            "min": ...,
            "max": ...,
            "median": ...
          }
        }

        Include realistic values only. For categorical columns, list the categories and their probabilities.
        For datetime columns, suggest realistic ranges.
        """
        
        response = client.models.generate_content(model='gemini-2.5-flash', contents=f"{system_prompt}\n\nColumn Definition:\n{json.dumps(request.column_definition)}")
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SuggestRelationshipsRequest(BaseModel):
    columns_list: List[dict]

@router.post("/ai/suggest-relationships")
async def ai_suggest_relationships(request: SuggestRelationshipsRequest):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in backend environment")
    
    try:
        client = genai.Client(api_key=api_key)
        
        
        system_prompt = """
        You are a data relationship designer.
        Your task is to define intelligent relationships between columns in a dataset.
        
        Supported relationships:
        - Linear: B increases/decreases proportionally with A (correlation strength -1 to 1)
        - Conditional: IF A > threshold THEN B = f(A), ELSE B = default (Ternary syntax: condition ? true_val : false_val)
        - Derived: B = mathematical function of A
        - Inverse: A and B move in opposite directions (Linear with negative strength)

        Task:
        1. For each relationship specified or discovered:
           - Identify source column(s) and target column
           - Validate the relationship is logically sound
           - Check for circular dependencies
           - Determine correlation strength (weak/moderate/strong)
        2. Output relationship rules as structured JSON.

        Format:
        {
          "relationships": [
            {
              "source": "column_A",
              "target": "column_B",
              "type": "linear|conditional|derived|inverse",
              "strength": "weak|moderate|strong",
              "formula": "mathematical expression or rule (use pandas/numpy syntax)",
              "validation": "Is this feasible? Any warnings?",
              "logic": "Explain the real-world connection"
            }
          ],
          "dependency_order": [list columns in order to generate],
          "conflicts": [any impossible constraints]
        }

        Important:
        - Prevent circular dependencies.
        - Use ternary syntax (cond ? val1 : val2) for conditional logic.
        - For Linear/Inverse, focus on 'strength' and 'type'.
        - For Derived/Conditional, focus on 'formula'.
        """
        
        response = client.models.generate_content(model='gemini-2.5-flash', contents=f"{system_prompt}\n\nColumns List:\n{json.dumps(request.columns_list)}")
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ValidateConstraintsRequest(BaseModel):
    schema: List[dict]
    constraints: List[dict]

@router.post("/ai/validate-constraints")
async def ai_validate_constraints(request: ValidateConstraintsRequest):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in backend environment")
    
    try:
        client = genai.Client(api_key=api_key)
        
        
        system_prompt = """
        You are a data constraint validation expert.
        Your task is to analyze a dataset schema and its logical constraints.
        
        Constraint types:
        - Column-level: age > 0, salary >= 50000
        - Cross-column: order_date > signup_date
        - Domain: email matches pattern
        - Cardinality: unique_id is unique
        - Logical: IF gender = "M" THEN pregnancy_months = NULL

        Task:
        1. Parse all constraints.
        2. Check for conflicts (impossible constraints like A > B and B > A).
        3. Define enforcement strategy (hard/soft).
        4. Ensure constraints align with field distributions.
        
        Output as structured JSON.
        """
        
        user_input = {
            "schema": request.schema,
            "constraints": request.constraints
        }
        
        response = client.models.generate_content(model='gemini-2.5-flash', contents=f"{system_prompt}\n\nInput Data:\n{json.dumps(user_input)}")
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SuggestNoiseRequest(BaseModel):
    schema: List[dict]
    global_noise_level: float

@router.post("/ai/suggest-noise")
async def ai_suggest_noise(request: SuggestNoiseRequest):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in backend environment")
    
    try:
        client = genai.Client(api_key=api_key)
        
        
        system_prompt = f"""
        You are a data quality degradation expert.
        Your task is to define a realistic noise injection strategy for a dataset.
        
        Global Target Noise Level: {request.global_noise_level}%
        
        Noise types:
        - Gaussian: add random normal distribution to numeric columns
        - Categorical flip: randomly change category values
        - Outliers: inject extreme values
        - Rounding: reduce precision
        - Corruption: random bit flip in text

        Task:
        1. For each column, determine appropriate noise injection method.
        2. Define noise parameters (intensity, percentage).
        3. Explain the expected impact on machine learning model performance.
        
        Output as structured JSON.
        """
        
        response = client.models.generate_content(model='gemini-2.5-flash', contents=f"{system_prompt}\n\nDataset Schema:\n{json.dumps(request.schema)}")
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SuggestMissingStrategyRequest(BaseModel):
    schema_def: List[dict]
    missing_percentage: float

@router.post("/ai/suggest-missing-strategy")
async def ai_suggest_missing_strategy(request: SuggestMissingStrategyRequest):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in backend environment")
    
    try:
        client = genai.Client(api_key=api_key)
        
        
        system_prompt = f"""
        You are a missing data simulation expert.

        Dataset properties:
        {json.dumps(request.schema_def)}

        User wants to inject missing values at {request.missing_percentage}% (0-100)

        Missing data patterns:
        - MCAR (Missing Completely At Random): random null values
        - MAR (Missing At Random): nulls depend on other column values
          Example: income_missing where employment_status = "student"
        - MNAR (Missing Not At Random): nulls depend on the value itself
          Example: high_salary values more likely to be missing
        - Structural: nulls in logical regions
          Example: pregnancy_months null where gender = "M"

        Task:
        1. For each column, determine missing pattern type
        2. Define missingness percentage
        3. If user requests pattern-based, specify the pattern (condition or target range)
        4. Ensure structural relationships are respected

        Output:
        {{
          "missing_strategy": [
            {{
              "column": "name",
              "pattern_type": "MCAR|MAR|MNAR|structural",
              "missing_percentage": percentage,
              "condition": "if applicable, the condition triggering nulls (e.g. 'age < 18')",
              "target_value_range": [low, high],
              "impact_on_training": "how this affects model performance"
            }}
          ],
          "total_missing_cells_estimate": count,
          "columns_most_affected": [list],
          "imputation_recommendations": [list of strategies]
        }}

        Be realistic. MCAR is random. MAR/MNAR needs logical explanations.
        """
        
        response = client.models.generate_content(model='gemini-2.5-flash', contents=system_prompt)
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        print(f"Missing Strategy Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class ImbalanceSimulationRequest(BaseModel):
    schema_def: List[dict]
    target_column: str
    current_distribution: Dict[str, float]
    desired_ratio: float # e.g. 0.1 for 10/90 split

@router.post("/ai/suggest-imbalance-strategy")
async def ai_suggest_imbalance_strategy(request: ImbalanceSimulationRequest):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in backend environment")
    
    try:
        client = genai.Client(api_key=api_key)
        
        
        system_prompt = f"""
        You are a class imbalance simulator.

        Dataset properties:
        Schema: {json.dumps(request.schema_def)}
        Target Column: {request.target_column}

        Current class distribution: {json.dumps(request.current_distribution)}
        Desired minority ratio: {request.desired_ratio}

        Task:
        1. Analyze feasibility of target ratio
        2. Determine resampling strategy:
           - Under-sampling: reduce majority class
           - Over-sampling: duplicate minority class
           - Synthetic: generate new minority samples
        3. Maintain feature distributions while changing labels
        4. Estimate metric impacts (Accuracy, Precision, Recall, F1)

        Output ONLY structured JSON:
        {{
          "imbalance_strategy": {{
            "method": "under_sample|over_sample|synthetic",
            "source_ratio": "current ratio string",
            "target_ratio": "desired ratio string",
            "samples_to_adjust": count,
            "resampling_map": {{ "class_a": 0.1, "class_b": 0.9 }}
          }},
          "expected_metric_impact": {{
            "accuracy": "description",
            "precision": "description",
            "recall": "description",
            "f1_score": "description"
          }},
          "warnings": [list any issues],
          "imbalance_report": "summary of changes and why accuracy alone is dangerous"
        }}

        Warn if ratio is too extreme (>99:1 is unrealistic).
        """
        
        response = client.models.generate_content(model='gemini-2.5-flash', contents=system_prompt)
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        print(f"Imbalance Strategy Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export/notebook")
async def export_notebook(request: NotebookExportRequest):
    try:
        df = pd.DataFrame(request.data)
        notebook_bytes = export_service.to_notebook(df, request.target_column)
        
        return Response(
            content=notebook_bytes,
            media_type="application/x-ipynb+json",
            headers={"Content-Disposition": "attachment; filename=synthetic_analysis.ipynb"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ResampleRequest(BaseModel):
    data: list
    target_column: str
    ratio_map: Dict[str, float]

@router.post("/ai/resample")
async def ai_resample_data(request: ResampleRequest):
    from app.core.imbalance_engine import imbalance_engine
    try:
        df = pd.DataFrame(request.data)
        resampled_df = imbalance_engine.apply(df, request.target_column, request.ratio_map)
        return {
            "data": resampled_df.to_dict(orient="records"),
            "message": "Data resampled successfully."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ScenarioExpertRequest(BaseModel):
    scenario_name: str

@router.post("/ai/suggest-scenario-schema")
async def ai_suggest_scenario_schema(request: ScenarioExpertRequest):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in backend environment")
    
    try:
        client = genai.Client(api_key=api_key)
        
        
        system_prompt = f"""
        You are an ML use-case domain expert.

        User selected scenario: {request.scenario_name}
        Available scenarios: Fraud Detection, Customer Churn, Credit Scoring, Recommendation System, Medical Diagnosis, Sentiment Analysis

        Task:
        1. For the selected scenario, design a complete dataset schema
        2. Include realistic columns and their properties (names, types, configs)
        3. Define feature relationships based on domain knowledge (correlations, constraints)
        4. Suggest appropriate distributions
        5. Identify typical ML challenges (imbalance, missing data, etc.)

        Output ONLY structured JSON:
        {{
          "scenario": "name",
          "description": "brief real-world context",
          "domain": "finance|healthcare|marketing|etc",
          "schema": {{
            "tables": [
              {{
                "id": "table1",
                "name": "TableName",
                "fields": [
                  {{
                    "id": "f1",
                    "name": "col_name",
                    "type": "integer|float|string|date|email|name|category|word|text|currency|percentage|boolean|uuid|datetime",
                    "config": {{ "min": 0, "max": 100, "categories": ["A", "B"] }},
                    "distribution": {{ "type": "normal|uniform|exponential|skewed|categorical", "params": {{}} }},
                    "nullable": true/false
                  }}
                ],
                "constraints": [{{ "rule": "logic", "type": "numeric|categorical" }}],
                "correlations": [{{ "feature_1": "a", "feature_2": "b", "type": "positive|negative", "strength": "weak|moderate|strong" }}]
              }}
            ]
          }},
          "typical_challenges": [
            "class imbalance",
            "missing values",
            "feature correlation",
            "outliers"
          ],
          "suggested_experiments": [
            "Effect of missing data",
            "Effect of imbalance"
          ],
          "realistic_baseline": {{
            "model": "recommended model type",
            "expected_accuracy": "range"
          }},
          "learning_objectives": [
            "what student should learn"
          ]
        }}

        Make scenarios realistic. Include domain-specific quirks.
        Example: Fraud detection always has imbalance (99%+ legitimate).
        """
        
        response = client.models.generate_content(model='gemini-2.5-flash', contents=system_prompt)
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        print(f"Scenario Expert Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/tuning-expert")
async def ai_tuning_expert(request: TuningExpertRequest):
    try:
        suggestions = tuning_expert_service.suggest_tuning(
            model_type=request.model_type,
            current_params=request.current_params,
            current_metrics=request.current_metrics
        )
        return suggestions
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/impact-analysis")
async def ai_impact_analysis(request: ImpactAnalysisRequest):
    try:
        analysis = impact_analysis_service.analyze(
            dataset_a=request.dataset_a,
            dataset_b=request.dataset_b,
            metrics_a=request.metrics_a,
            metrics_b=request.metrics_b,
            schema=request.schema_def
        )
        return analysis
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/feature-analysis")
async def ai_feature_analysis(request: FeatureAnalysisRequest):
    try:
        analysis = feature_analysis_service.analyze(
            model_type=request.model_type,
            schema=request.schema_def,
            importance_scores=request.importance_scores
        )
        return analysis
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/stress-test")
async def ai_stress_test(request: StressTestRequest):
    try:
        analysis = experiment_design_service.run_noise_experiment(
            data=request.data,
            target_column=request.target_column,
            model_type=request.model_type,
            schema=request.schema_def
        )
        return analysis
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/missing-data-experiment")
async def ai_missing_data_experiment(request: StressTestRequest):
    try:
        analysis = experiment_design_service.run_missing_data_experiment(
            data=request.data,
            target_column=request.target_column,
            model_type=request.model_type,
            schema=request.schema_def
        )
        return analysis
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/imbalance-experiment")
async def ai_imbalance_experiment(request: StressTestRequest):
    try:
        analysis = experiment_design_service.run_imbalance_experiment(
            data=request.data,
            target_column=request.target_column,
            model_type=request.model_type,
            schema=request.schema_def
        )
        return analysis
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ─── Export Endpoints ────────────────────────────────────────────────────────
# IMPORTANT: /export/multi/{format} must be registered BEFORE /export/{format}
# so that FastAPI doesn't match "/export/multi/csv" as format="multi".

@router.post("/export/multi/{format}")
async def export_multi_table(format: str, schema: SchemaDefinition):
    """Generate data from a multi-table schema and return it as a downloadable file."""
    try:
        data_dict, _ = relational_gen.generate(schema)

        if format == "csv":
            content = export_service.to_zip(
                {name: df for name, df in data_dict.items()}
            )
            return StreamingResponse(
                io.BytesIO(content),
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=generated_data.zip"}
            )
        elif format == "json":
            merged = {name: df.to_dict(orient="records") for name, df in data_dict.items()}
            json_bytes = json.dumps(merged, indent=2, default=str).encode("utf-8")
            return StreamingResponse(
                io.BytesIO(json_bytes),
                media_type="application/json",
                headers={"Content-Disposition": "attachment; filename=generated_data.json"}
            )
        elif format == "sql":
            lines = []
            for table_name, df in data_dict.items():
                cols = list(df.columns)
                for _, row in df.iterrows():
                    vals = ", ".join([f"'{str(v)}'" for v in row.values])
                    lines.append(f"INSERT INTO {table_name} ({', '.join(cols)}) VALUES ({vals});")
            sql_bytes = "\n".join(lines).encode("utf-8")
            return StreamingResponse(
                io.BytesIO(sql_bytes),
                media_type="application/sql",
                headers={"Content-Disposition": "attachment; filename=generated_data.sql"}
            )
        elif format == "excel":
            import pandas as pd
            buf = io.BytesIO()
            with pd.ExcelWriter(buf, engine="openpyxl") as writer:
                for table_name, df in data_dict.items():
                    df.to_excel(writer, index=False, sheet_name=table_name[:31])
            buf.seek(0)
            return StreamingResponse(
                buf,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": "attachment; filename=generated_data.xlsx"}
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {format}")

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/export/{format}")
async def export_single_table(format: str, schema: SingleTableSchemaDefinition):
    """Generate data from a single-table schema and return it as a downloadable file."""
    try:
        df, _ = pipeline.run(schema)

        if format == "csv":
            content = export_service.to_csv(df)
            return StreamingResponse(
                io.BytesIO(content),
                media_type="text/csv",
                headers={"Content-Disposition": "attachment; filename=generated_data.csv"}
            )
        elif format == "json":
            content = export_service.to_json(df)
            return StreamingResponse(
                io.BytesIO(content),
                media_type="application/json",
                headers={"Content-Disposition": "attachment; filename=generated_data.json"}
            )
        elif format == "sql":
            table_name = "generated_data"
            lines = []
            cols = list(df.columns)
            for _, row in df.iterrows():
                vals = ", ".join([f"'{str(v)}'" for v in row.values])
                lines.append(f"INSERT INTO {table_name} ({', '.join(cols)}) VALUES ({vals});")
            sql_bytes = "\n".join(lines).encode("utf-8")
            return StreamingResponse(
                io.BytesIO(sql_bytes),
                media_type="application/sql",
                headers={"Content-Disposition": "attachment; filename=generated_data.sql"}
            )
        elif format == "excel":
            buf = io.BytesIO()
            df.to_excel(buf, index=False, sheet_name="Sheet1")
            buf.seek(0)
            return StreamingResponse(
                buf,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": "attachment; filename=generated_data.xlsx"}
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {format}")

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
