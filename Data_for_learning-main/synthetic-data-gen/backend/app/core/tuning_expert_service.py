import json
import os
from google import genai
from typing import Dict, Any, List

class TuningExpertService:
    def suggest_tuning(self, model_type: str, current_params: dict, current_metrics: dict) -> Dict[str, Any]:
        """
        Analyze current state and suggest hyperparameter changes with causal explanations.
        """
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return {"error": "GOOGLE_API_KEY not found"}

        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are a hyperparameter tuning expert.
        
        Model type: {model_type}
        Current hyperparameters: {json.dumps(current_params)}
        Current metrics: {json.dumps(current_metrics)}
        
        Task:
        1. Analyze current performance.
        2. Identify potential improvements.
        3. Suggest hyperparameter changes (one at a time, for clarity).
        4. Predict impact on metrics.
        5. Explain the cause-effect relationship.
        
        Available parameters to tune (depending on model):
        - Trees (DecisionTree, RandomForest): max_depth, min_samples_split, min_samples_leaf
        - Linear/Logistic: C (inverse regularization), penalty, learning_rate (if applicable)
        - Ensemble (GradientBoosting): n_estimators, learning_rate, subsample
        
        Output MUST be structured JSON exactly matching this format:
        {{
          "tuning_suggestions": [
            {{
              "parameter": "name",
              "current_value": value,
              "suggested_range": [min, max],
              "expected_effect": {{
                "metric_affected": "accuracy|precision|recall|etc",
                "direction": "increase|decrease",
                "magnitude": "large|moderate|small"
              }},
              "explanation": "why this change helps",
              "when_to_use": "use this when you observe..."
            }}
          ],
          "tuning_order": [
            "tune this first",
            "then tune this"
          ]
        }}
        """
        
        try:
            response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
            text = response.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            
            return json.loads(text)
        except Exception as e:
            print(f"Tuning Expert AI Error: {str(e)}")
            return {"error": str(e)}

tuning_expert_service = TuningExpertService()
