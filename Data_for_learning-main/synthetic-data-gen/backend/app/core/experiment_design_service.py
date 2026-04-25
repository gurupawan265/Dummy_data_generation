import pandas as pd
import numpy as np
import json
import os
from google import genai
from typing import Dict, Any, List
from app.core.experiment_service import experiment_service
from app.core.noise_injector import noise_injector
from app.core.schema import NoiseConfig

class ExperimentDesignService:
    def run_noise_experiment(self, data: list, target_column: str, model_type: str, schema: dict) -> Dict[str, Any]:
        """
        Runs a simulation: Model performance vs Increasing Noise.
        """
        noise_levels = [0.0, 0.05, 0.1, 0.2, 0.3]
        results = []
        df_base = pd.DataFrame(data)
        
        for level in noise_levels:
            df_noisy = df_base.copy()
            feature_cols = [c for c in df_noisy.columns if c != target_column]
            for col in feature_cols:
                if level == 0: continue
                ctype = "gaussian" if np.issubdtype(df_noisy[col].dtype, np.number) else "flip"
                config = NoiseConfig(type=ctype, intensity=level)
                df_noisy[col] = noise_injector.apply(df_noisy, col, config)
            
            try:
                train_res = experiment_service.train_model(
                    data=df_noisy.to_dict(orient="records"),
                    target_column=target_column,
                    model_type=model_type
                )
                m = train_res["metrics"]
                results.append({
                    "noise_level": f"{int(level * 100)}%",
                    "accuracy": m.get("accuracy", 0) or m.get("r2", 0),
                    "f1_score": m.get("f1", 0) or m.get("mae", 0)
                })
            except:
                pass

        return self._generate_analysis(results, "Effect of Noise", model_type, target_column)

    def run_missing_data_experiment(self, data: list, target_column: str, model_type: str, schema: dict) -> Dict[str, Any]:
        """
        Runs a simulation: Model performance vs Missing Data (with/without imputation).
        """
        missing_levels = [0.0, 0.1, 0.2, 0.3]
        results = []
        df_base = pd.DataFrame(data)
        
        for level in missing_levels:
            df_missing = df_base.copy()
            if level > 0:
                # Inject random missing values in features
                feature_cols = [c for c in df_missing.columns if c != target_column]
                for col in feature_cols:
                    mask = np.random.random(len(df_missing)) < level
                    df_missing.loc[mask, col] = np.nan
            
            # 1. Train WITHOUT imputation (sklearn models usually fail with NaN, so we drop rows as fallback)
            df_no_imp = df_missing.dropna()
            m_no_imp = {"accuracy": 0, "f1": 0, "completed": False}
            if len(df_no_imp) > 10:
                try:
                    res = experiment_service.train_model(df_no_imp.to_dict(orient="records"), target_column, model_type)
                    m_no_imp = {**res["metrics"], "completed": True}
                except: pass
            
            # 2. Train WITH mean/mode imputation
            df_imp = df_missing.copy()
            for col in df_imp.columns:
                if df_imp[col].isnull().any():
                    if np.issubdtype(df_imp[col].dtype, np.number):
                        df_imp[col] = df_imp[col].fillna(df_imp[col].mean())
                    else:
                        df_imp[col] = df_imp[col].fillna(df_imp[col].mode()[0] if not df_imp[col].mode().empty else "missing")
            
            m_imp = {"accuracy": 0, "f1": 0}
            try:
                res = experiment_service.train_model(df_imp.to_dict(orient="records"), target_column, model_type)
                m_imp = res["metrics"]
            except: pass
            
            results.append({
                "missing_percent": f"{int(level * 100)}%",
                "without_imputation": {
                    "accuracy": m_no_imp.get("accuracy", 0) or m_no_imp.get("r2", 0),
                    "f1_score": m_no_imp.get("f1", 0) or m_no_imp.get("mae", 0),
                    "training_completed": m_no_imp.get("completed", False)
                },
                "with_mean_imputation": {
                    "accuracy": m_imp.get("accuracy", 0) or m_imp.get("r2", 0),
                    "f1_score": m_imp.get("f1", 0) or m_imp.get("mae", 0),
                    "improvement": (m_imp.get("accuracy", 0) or m_imp.get("r2", 0)) - (m_no_imp.get("accuracy", 0) or m_no_imp.get("r2", 0))
                }
            })

        # Call Gemini for Expert Commentary
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key: return {"results": results}

        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are an experiment design expert.
        
        Experiment: Effect of Missing Data (Imputation vs No Imputation)
        Results: {json.dumps(results)}
        
        Task:
        1. Summarize how missing data hurts performance.
        2. Highlight the dramatic difference imputation makes.
        3. Provide learning insights and a preprocessing lesson.
        
        Output MUST be structured JSON:
        {{
          "experiment": "Effect of Missing Data",
          "hypothesis": "Missing data hurts performance; imputation helps",
          "comparison": "side-by-side improvement from imputation",
          "learning_insight": [
            "Missing data is a major problem",
            "Imputation helps but isn't perfect",
            "Better imputation strategies exist"
          ],
          "preprocessing_lesson": "why data cleaning matters"
        }}
        """
        
        try:
            response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
            text = response.text
            if "```json" in text: text = text.split("```json")[1].split("```")[0].strip()
            analysis = json.loads(text)
            analysis["results"] = results
            return analysis
        except:
            return {"results": results}

    def run_imbalance_experiment(self, data: list, target_column: str, model_type: str, schema: dict) -> Dict[str, Any]:
        """
        Runs a simulation: Performance metrics across increasing class imbalance.
        """
        ratios = [0.5, 0.2, 0.1, 0.05, 0.01] # Minor class percentage
        results = []
        df_base = pd.DataFrame(data)
        
        # Identify majority and minority classes
        counts = df_base[target_column].value_counts()
        if len(counts) < 2: return {"error": "Target must have at least 2 classes for imbalance test."}
        
        maj_class = counts.index[0]
        min_class = counts.index[1]
        
        df_maj = df_base[df_base[target_column] == maj_class]
        df_min = df_base[df_base[target_column] == min_class]

        for ratio in ratios:
            # Sample to reach ratio
            # ratio = min / (min + maj) => maj = min * (1-ratio) / ratio
            target_min_count = len(df_min)
            target_maj_count = int(target_min_count * (1 - ratio) / ratio)
            
            # If we don't have enough majority, we downsample minority instead
            if target_maj_count > len(df_maj):
                target_maj_count = len(df_maj)
                target_min_count = int(target_maj_count * ratio / (1 - ratio))
            
            df_s_maj = df_maj.sample(n=target_maj_count, replace=False)
            df_s_min = df_min.sample(n=target_min_count, replace=False)
            df_imbalanced = pd.concat([df_s_maj, df_s_min]).sample(frac=1) # Shuffle
            
            try:
                train_res = experiment_service.train_model(
                    data=df_imbalanced.to_dict(orient="records"),
                    target_column=target_column,
                    model_type=model_type
                )
                m = train_res["metrics"]
                results.append({
                    "ratio": f"{int((1-ratio)*100)}:{int(ratio*100)}",
                    "accuracy": m.get("accuracy", 0),
                    "precision": m.get("precision", 0),
                    "recall": m.get("recall", 0),
                    "f1_score": m.get("f1", 0),
                })
            except: pass

        # Expert Analysis via Gemini
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key: return {"results": results}

        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are an experiment design expert.
        
        Experiment: Why Accuracy is Misleading for Imbalanced Data
        Results: {json.dumps(results)}
        
        Task:
        1. Explain why accuracy stays high while other metrics drop.
        2. Highlight the 'Aha moment': accuracy is a trap.
        3. Provide critical observations and metric recommendations.
        
        Output MUST be structured JSON:
        {{
          "experiment": "Why Accuracy is Misleading for Imbalanced Data",
          "hypothesis": "On imbalanced data, accuracy is high but model is useless",
          "critical_observation": {{
            "naive_prediction": "Always predicting the majority class",
            "accuracy_of_naive": "approx {results[-1]['ratio'].split(':')[0]}%",
            "why_accuracy_fails": "accuracy doesn't penalize predicting same class always"
          }},
          "lesson": [
            "Use F1 or ROC-AUC for imbalanced data",
            "Precision/Recall tell the real story"
          ],
          "metric_recommendation": "F1-Score or Balanced Accuracy"
        }}
        """
        try:
            response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
            text = response.text
            if "```json" in text: text = text.split("```json")[1].split("```")[0].strip()
            analysis = json.loads(text)
            analysis["results"] = results
            return analysis
        except:
            return {"results": results}

    def _generate_analysis(self, results, experiment_name, model_type, target):
        # (Keep existing _generate_analysis but updated for generic use)
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key: return {"results": results}
        client = genai.Client(api_key=api_key)
        prompt = f"Analyze results for {experiment_name}: {json.dumps(results)}"
        try:
            response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
            text = response.text
            if "```json" in text: text = text.split("```json")[1].split("```")[0].strip()
            analysis = json.loads(text)
            analysis["results"] = results
            return analysis
        except: return {"results": results}

experiment_design_service = ExperimentDesignService()
