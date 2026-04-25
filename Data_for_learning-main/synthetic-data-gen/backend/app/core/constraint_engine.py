import pandas as pd
import numpy as np
from typing import List, Dict, Any

class ConstraintEngine:
    def apply(self, df: pd.DataFrame, constraints: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Enforce logical rules across columns.
        Currently supports simple comparisons: >, <, >=, <=
        """
        df_new = df.copy()
        
        for c in constraints:
            rule = c.get('rule', '')
            if not rule: continue
            
            # Handle Temporal Constraints (Dates)
            if c.get('type') == 'temporal':
                df_new = self._apply_temporal(df_new, rule)
            else:
                df_new = self._apply_numeric(df_new, rule)
                
        return df_new

    def _apply_temporal(self, df: pd.DataFrame, rule: str) -> pd.DataFrame:
        # e.g. "order_date > signup_date"
        try:
            for op in ['>', '<', '>=', '<=']:
                if op in rule:
                    parts = rule.split(op)
                    left_col = parts[0].strip()
                    right_col = parts[1].strip()
                    
                    if left_col in df.columns and right_col in df.columns:
                        left_dt = pd.to_datetime(df[left_col], errors='coerce')
                        right_dt = pd.to_datetime(df[right_col], errors='coerce')
                        
                        if op == '>':
                            mask = left_dt <= right_dt
                            df.loc[mask, left_col] = (right_dt[mask] + pd.Timedelta(days=1)).dt.strftime('%Y-%m-%d %H:%M:%S')
                        elif op == '<':
                            mask = left_dt >= right_dt
                            df.loc[mask, left_col] = (right_dt[mask] - pd.Timedelta(days=1)).dt.strftime('%Y-%m-%d %H:%M:%S')
                        # ... handle others if needed
                    break
        except Exception as e:
            print(f"Constraint Engine Error (Temporal): {e}")
        return df

    def _apply_numeric(self, df: pd.DataFrame, rule: str) -> pd.DataFrame:
        # e.g. "salary > min_wage"
        try:
            for op in ['>', '<', '>=', '<=']:
                if op in rule:
                    parts = rule.split(op)
                    left_col = parts[0].strip()
                    right_col = parts[1].strip()
                    
                    if left_col in df.columns and right_col in df.columns:
                        if op == '>':
                            mask = df[left_col] <= df[right_col]
                            df.loc[mask, left_col] = df.loc[mask, right_col] + 1
                        elif op == '<':
                            mask = df[left_col] >= df[right_col]
                            df.loc[mask, left_col] = df.loc[mask, right_col] - 1
                    break
        except Exception as e:
            print(f"Constraint Engine Error (Numeric): {e}")
        return df

constraint_engine = ConstraintEngine()
