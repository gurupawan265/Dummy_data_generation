import json
import os
from google import genai
from typing import Dict, Any, List

class CausalityService:
    def explain_causality(self, characteristic: str, metric_changes: str) -> Dict[str, Any]:
        """
        Explain the causal relationship between data shifts and model behavior.
        """
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return {"error": "GOOGLE_API_KEY not found"}

        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are an ML Causality Expert. Your goal is to explain the logical and mathematical relationships between data characteristics and model behavior.
        
        Input:
        - Dataset characteristic changed: {characteristic}
        - Model metric changes: {metric_changes}
        
        Task:
        1. Explain WHY this characteristic affects these metrics specifically.
        2. Focus on LOGIC and CAUSALITY (not coincidence).
        3. Explain both direction and magnitude.
        4. Explain trade-offs (e.g., why precision might go up while recall goes down).

        Return output in structured JSON matching this EXACT format:
        {{
          "characteristic_change": "Clear description of what changed in the data",
          "affected_metrics": [
            {{
              "metric": "name of the metric",
              "change": "direction and magnitude (e.g., Recall dropped by 30%)",
              "causal_explanation": "Logical explanation of why this metric changed based on the data shift",
              "mathematical_intuition": "Brief mathematical intuition behind the change"
            }}
          ],
          "why_not_all_metrics_change_equally": "Detailed logical explanation of why metrics don't move in sync",
          "trade_off_explanation": "Explanation of the trade-offs involved (e.g., Precision-Recall trade-off)",
          "broader_principle": "Generalize this causality to other similar scenarios",
          "conceptual_takeaway": "The deep principle the user should remember (e.g., 'Accuracy is misleading on imbalanced data')"
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
            print(f"Causality Expert AI Error: {str(e)}")
            return {"error": str(e)}

causality_service = CausalityService()
