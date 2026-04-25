import json
import os
from google import genai
from typing import Dict, Any, List

class LearningAssistantService:
    def explain_to_student(
        self, 
        experiment_type: str, 
        results_data: Dict[str, Any], 
        student_profile: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Provides a hierarchical, intuition-building explanation of ML experiment results.
        """
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return {"error": "GOOGLE_API_KEY not found"}

        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are an ML Learning Assistant. Your job is to explain results to students in a way that builds intuition.
        
        CONTEXT:
        - Experiment Type: {experiment_type}
        - Results Data: {json.dumps(results_data)}
        - Student Profile: {json.dumps(student_profile)}
        
        YOUR TASK:
        Provide explanations in a STRUCTURED, HIERARCHICAL format.
        Build from simple observations to deeper principles.
        Use metaphors and analogies. 
        Flag misconceptions explicitly.
        Each metric change needs a causal explanation.

        Return ONLY valid JSON matching this EXACT format (no markdown):
        {{
          "summary": {{
            "one_liner": "Single sentence that captures the key finding",
            "visual_metaphor": "Real-world analogy or intuitive comparison"
          }},
          "level_1_key_findings": {{
            "title": "What Just Happened?",
            "points": [
              "Most obvious observation",
              "What changed from baseline?",
              "Is this expected or surprising?"
            ],
            "tone": "conversational, no jargon"
          }},
          "level_2_why_it_happened": {{
            "title": "Why Did This Happen?",
            "sections": [
              {{
                "aspect": "what changed in the data",
                "impact": "how that affected the model",
                "causal_chain": "A happened → B changed → C resulted"
              }}
            ],
            "tone": "educational, explain mechanisms"
          }},
          "level_3_deep_understanding": {{
            "title": "The Deeper Principle",
            "concept": "What general principle is this teaching?",
            "mathematical_intuition": "How would you express this mathematically? (words, no equations)",
            "when_this_matters": "When will you encounter this again?",
            "connections": "How does this relate to other ML concepts?"
          }},
          "metric_breakdown": [
            {{
              "metric": "name (accuracy|precision|recall|f1|auc)",
              "value_a": "value in condition A",
              "value_b": "value in condition B",
              "delta": "change (e.g., -5%)",
              "explanation": "Why did THIS metric change specifically? (2-3 sentences)",
              "interpretation": "Is this good or bad? Why?"
            }}
          ],
          "misconceptions": [
            {{
              "wrong_idea": "common mistake students make here",
              "why_its_wrong": "brief explanation",
              "correct_understanding": "what they should think instead"
            }}
          ],
          "actionable_next_steps": [
            {{
              "action": "specific thing to try next",
              "rationale": "why this makes sense",
              "expected_outcome": "what should happen?",
              "difficulty": "easy|medium|hard",
              "related_experiment": "which experiment to try"
            }}
          ],
          "student_insight": "One powerful sentence they should remember from this"
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
            print(f"Learning Assistant AI Error: {str(e)}")
            return {"error": str(e)}

learning_assistant_service = LearningAssistantService()
