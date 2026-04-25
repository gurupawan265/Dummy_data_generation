import pandas as pd
import numpy as np
import json
import os
from google import genai
from typing import Dict, Any, List
from app.core.experiment_service import experiment_service
from app.core.noise_injector import noise_injector
from app.core.schema import NoiseConfig

class StressTestService:
    def run_noise_experiment(self, data: list, target_column: str, model_type: str, schema: dict) -> Dict[str, Any]:
        """
        Runs a simulation: Model performance vs Increasing Noise.
        """
        noise_levels = [0.0, 0.05, 0.1, 0.2, 0.3]
        results = []
        
        df_base = pd.DataFrame(data)
        
        for level in noise_levels:
            df_noisy = df_base.copy()
            
            # Inject noise into all feature columns (not target)
            feature_cols = [c for c in df_noisy.columns if c != target_column]
            for col in feature_cols:
                if level == 0: continue
                
                # Determine noise type based on column type
                if np.issubdtype(df_noisy[col].dtype, np.number):
                    ctype = "gaussian"
                else:
                    ctype = "flip"
                
                config = NoiseConfig(type=ctype, intensity=level)
                df_noisy[col] = noise_injector.apply(df_noisy, col, config)
            
            # Train model
            try:
                train_res = experiment_service.train_model(
                    data=df_noisy.to_dict(orient="records"),
                    target_column=target_column,
                    model_type=model_type
                )
                
                m = train_res["metrics"]
                results.append({
                    "noise_level": f"{int(level * 100)}%",
                    "accuracy": m.get("accuracy", 0),
                    "precision": m.get("precision", 0),
                    "recall": m.get("recall", 0),
                    "f1_score": m.get("f1", 0),
                    # Fallbacks for regression
                    "r2": m.get("r2", 0),
                    "mae": m.get("mae", 0)
                })
            except Exception as e:
                print(f"Stress Test Step Failed for level {level}: {e}")

        # Call Gemini for trend analysis and narrative
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return {"error": "GOOGLE_API_KEY not found"}

        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are an experiment design expert.
        
        Experiment: Effect of Noise on Model Performance
        Model: {model_type}
        Target: {target_column}
        
        Raw Results:
        {json.dumps(results)}
        
        Task:
        1. Summarize the trend (accuracy/performance vs noise).
        2. Identify the "breaking point" (where performance drops significantly).
        3. Provide a learning insight for students.
        4. Suggest the "next experiment".
        
        Output MUST be structured JSON:
        {{
          "experiment": "Effect of Noise on Model Performance",
          "hypothesis": "As noise increases, model performance degrades because the signal-to-noise ratio decreases.",
          "trend_analysis": {{
            "accuracy_trend": "declining|stable|erratic",
            "degradation_rate": "description",
            "threshold": "at what noise level does performance become unusable?"
          }},
          "learning_insight": "what students should realize (narrative story)",
          "next_experiment": "suggest related experiment"
        }}
        """
        
        try:
            response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
            text = response.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            
            analysis = json.loads(text)
            analysis["results"] = results
            return analysis
        except Exception as e:
            print(f"Stress Test AI Error: {str(e)}")
            return {"results": results, "error": str(e)}

stress_test_service = StressTestService()
