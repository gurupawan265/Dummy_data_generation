import json
import os
from google import genai
from typing import Dict, Any, List

class FeatureAnalysisService:
    def analyze(self, model_type: str, schema: dict, importance_scores: dict) -> Dict[str, Any]:
        """
        Rank features, explain importance, and suggest engineering ideas.
        """
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return {"error": "GOOGLE_API_KEY not found"}

        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are a feature analysis expert.
        
        Trained model: {model_type}
        Dataset Schema: {json.dumps(schema)}
        Feature importance scores (normalized 0-1): {json.dumps(importance_scores)}
        
        Task:
        1. Rank features by importance.
        2. For top-5 features, explain WHY they matter in business/real-world terms.
        3. Identify low-importance features and likely reasons (noise, redundancy, no signal).
        4. Suggest 3 specific feature engineering opportunities based on the schema (e.g., combinations, interactions).
        
        Output MUST be structured JSON exactly matching this format:
        {{
          "feature_rankings": [
            {{
              "rank": 1,
              "feature": "name",
              "importance_score": value,
              "percentage": percent,
              "why_it_matters": "plain explanation of what this feature captures",
              "real_world_intuition": "example: age matters because younger users have different behavior"
            }}
          ],
          "low_importance_features": [
            {{
              "feature": "name",
              "importance_score": value,
              "likely_reason": "too correlated with another feature|no predictive power|etc",
              "recommendation": "keep|remove|engineer"
            }}
          ],
          "feature_engineering_ideas": [
            "combine A and B to create C...",
            "..."
          ],
          "top_3_features_explain": "overall summary of what drives predictions"
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
            print(f"Feature Analysis Expert AI Error: {str(e)}")
            return {"error": str(e)}

feature_analysis_service = FeatureAnalysisService()
