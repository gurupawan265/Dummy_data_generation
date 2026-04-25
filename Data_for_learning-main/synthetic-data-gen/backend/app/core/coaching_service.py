import json
import os
from google import genai
from typing import Dict, Any, List

class CoachingService:
    def get_coaching(self, issues_found: List[Dict[str, Any]], metrics: Dict[str, Any], problem_type: str) -> Dict[str, Any]:
        """
        Analyze dataset and model issues to provide coaching and actionable recommendations.
        """
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return {"error": "GOOGLE_API_KEY not found"}

        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are an ML Coaching Assistant. Your goal is to help students diagnose performance issues and learn from them.
        
        Context:
        - Dataset Issues Detected: {json.dumps(issues_found)}
        - Model Performance: {json.dumps(metrics)}
        - Problem Type: {problem_type}
        
        Possible issues to consider:
        - High variance (train accuracy >> test accuracy)
        - High bias (both train and test accuracy low)
        - Class imbalance (precision high but recall low)
        - Missing data impact (accuracy degrading)
        - Noisy features (adding noise hurts performance significantly)
        
        Task:
        1. Identify performance problems.
        2. Diagnose root causes (data vs model).
        3. Suggest specific, actionable fixes.
        4. Rank recommendations by impact and ease of implementation.
        
        Output MUST be structured JSON matching this EXACT format:
        {{
          "diagnosis": {{
            "primary_problem": "overfitting|underfitting|class_imbalance|missing_data|noise",
            "evidence": "Describe which metrics or data properties indicate this issue."
          }},
          "recommendations": [
            {{
              "rank": 1,
              "action": "specific actionable fix (e.g., Increase max_depth or Add regularization)",
              "rationale": "Why this specific change will help the current problem",
              "expected_improvement": "A clear statement like 'Accuracy will likely improve by ~5%'",
              "difficulty": "easy|medium|hard",
              "related_concept": "The underlying ML concept the student should learn (e.g., Occam's Razor, Signal-to-Noise)"
            }}
          ],
          "quick_wins": [
            "easiest fix to try first"
          ],
          "long_term_improvements": [
            "more advanced strategies to consider"
          ],
          "warning": "Important warnings (e.g., 'Do not just add data if it's already redundant')"
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
            print(f"Coaching Assistant AI Error: {str(e)}")
            return {"error": str(e)}

coaching_service = CoachingService()
