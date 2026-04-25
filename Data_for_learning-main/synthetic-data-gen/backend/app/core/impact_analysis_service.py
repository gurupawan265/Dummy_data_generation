import pandas as pd
import numpy as np
import json
import os
from google import genai
from typing import Dict, Any, List

class ImpactAnalysisService:
    def analyze(self, dataset_a: list, dataset_b: list, metrics_a: dict, metrics_b: dict, schema: dict) -> Dict[str, Any]:
        """
        Identify key differences, correlate to metric changes, and explain causality.
        """
        df_a = pd.DataFrame(dataset_a)
        df_b = pd.DataFrame(dataset_b)
        
        # 1. Identify key differences in data properties
        diffs = self._compare_datasets(df_a, df_b)
        
        # 2. Call Gemini for causal analysis
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return {"error": "GOOGLE_API_KEY not found"}

        client = genai.Client(api_key=api_key)
        
        prompt = self._build_prompt(diffs, metrics_a, metrics_b, schema)
        
        try:
            response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
            text = response.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            
            analysis = json.loads(text)
            
            # Merge with metric deltas
            analysis["metric_changes"] = self._calculate_metric_deltas(metrics_a, metrics_b)
            analysis["dataset_comparison"] = {"key_differences": diffs}
            
            return analysis
        except Exception as e:
            print(f"Impact Analysis AI Error: {str(e)}")
            return {"error": str(e)}

    def _compare_datasets(self, df_a: pd.DataFrame, df_b: pd.DataFrame) -> List[Dict[str, Any]]:
        diffs = []
        
        # Check imbalance (assuming classification if target has few unique values)
        # For simplicity, we compare standard properties
        for col in df_a.columns:
            if col not in df_b.columns: continue
            
            # Missing values
            m_a = float(df_a[col].isna().mean())
            m_b = float(df_b[col].isna().mean())
            if abs(m_a - m_b) > 0.01:
                diffs.append({
                    "aspect": "missing_values",
                    "column": col,
                    "dataset_a": f"{m_a:.1%}",
                    "dataset_b": f"{m_b:.1%}",
                    "change": "increase" if m_b > m_a else "decrease"
                })
            
            # Noise/Variance (for numeric)
            if np.issubdtype(df_a[col].dtype, np.number):
                v_a = float(df_a[col].std())
                v_b = float(df_b[col].std())
                if v_a > 0 and abs(v_b / v_a - 1) > 0.1:
                    diffs.append({
                        "aspect": "noise",
                        "column": col,
                        "dataset_a": f"{v_a:.2f} (std)",
                        "dataset_b": f"{v_b:.2f} (std)",
                        "change": "increase" if v_b > v_a else "decrease"
                    })
            
            # Imbalance (for categorical/low-cardinality)
            if df_a[col].nunique() < 10:
                counts_a = df_a[col].value_counts(normalize=True)
                counts_b = df_b[col].value_counts(normalize=True)
                
                # Check entropy change or just max class change
                max_a = float(counts_a.iloc[0])
                max_b = float(counts_b.iloc[0])
                if abs(max_a - max_b) > 0.05:
                    diffs.append({
                        "aspect": "imbalance",
                        "column": col,
                        "dataset_a": f"{max_a:.1%} (majority)",
                        "dataset_b": f"{max_b:.1%} (majority)",
                        "change": "increase" if max_b > max_a else "decrease"
                    })
                    
        return diffs

    def _calculate_metric_deltas(self, metrics_a: dict, metrics_b: dict) -> dict:
        changes = {}
        for k in metrics_a:
            if k in metrics_b and isinstance(metrics_a[k], (int, float)):
                v_a = float(metrics_a[k])
                v_b = float(metrics_b[k])
                delta = v_b - v_a
                
                # Significance heuristic
                sig = "small"
                if abs(delta) > 0.1: sig = "large"
                elif abs(delta) > 0.02: sig = "moderate"
                
                changes[k] = {
                    "dataset_a_value": round(v_a, 4),
                    "dataset_b_value": round(v_b, 4),
                    "delta": round(delta, 4),
                    "significance": sig
                }
        return changes

    def _build_prompt(self, diffs, metrics_a, metrics_b, schema):
        return f"""
        You are a Machine Learning Interpreter. Your goal is to explain model performance changes to students in plain English.
        
        Dataset Schema: {json.dumps(schema)}
        Data Differences Identified: {json.dumps(diffs)}
        Metrics A (Before): {json.dumps(metrics_a)}
        Metrics B (After): {json.dumps(metrics_b)}
        
        Rules:
        1. Use analogies (e.g., "Adding noise is like people whispering in a library").
        2. Avoid technical jargon where possible.
        3. Explain the cause-and-effect relationship clearly.
        4. Focus on the 'Why' behind the metric changes.

        Return output in structured JSON matching this EXACT format:
        {{
          "summary": "one sentence explaining the key finding",
          "what_changed_in_data": [
            {{
              "aspect": "noise|imbalance|missing|correlation",
              "change": "description of the data change",
              "magnitude": "small|moderate|large"
            }}
          ],
          "what_changed_in_model": [
            {{
              "metric": "accuracy|precision|recall|f1",
              "change": "direction and magnitude (e.g., dropped by 10%)",
              "reason": "plain English explanation of why this specific metric changed"
            }}
          ],
          "causal_explanation": "Connect cause to effect. Why did this happen?",
          "real_world_analogy": "Explain using everyday example",
          "student_insight": "What should the student learn from this?",
          "misconception_to_avoid": "Common wrong interpretation"
        }}
        """

impact_analysis_service = ImpactAnalysisService()
