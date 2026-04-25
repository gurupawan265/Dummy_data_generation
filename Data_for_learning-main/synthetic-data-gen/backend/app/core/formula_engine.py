import pandas as pd
import numpy as np
import re
from typing import List, Dict, Any

class FormulaEngine:
    def evaluate(self, df: pd.DataFrame, formulas: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Evaluate a list of formulas on a dataframe.
        Expected formula structure: { "name": "total", "expression": "price * quantity" }
        """
        # 1. Resolve dependencies (topological sort)
        # For simplicity in this session, we'll assume linear dependencies or handle them by iteration
        # Advanced topological sort can be added if formulas depend on each other deeply
        
        for formula in formulas:
            name = formula["name"]
            expr = formula["expression"]
            
            try:
                # Replace ternary syntax: condition ? true : false -> np.where(condition, true, false)
                # Matches: (anything) ? (anything) : (anything)
                ternary_match = re.match(r"(.*)\?(.*):(.*)", expr)
                if ternary_match:
                    cond, t_val, f_val = ternary_match.groups()
                    # Vectorized ternary using np.where
                    # Note: This is a simple parser, might need more robust regex for complex nested ternaries
                    df[name] = np.where(df.eval(cond.strip()), df.eval(t_val.strip()), df.eval(f_val.strip()))
                else:
                    # Standard pandas eval for arithmetic and boolean
                    df[name] = df.eval(expr)
            except Exception as e:
                print(f"Formula error in '{name}': {e}")
                df[name] = None
        
        return df

    def get_execution_order(self, fields: List[Any], relationships: List[Any]) -> List[str]:
        # This would build a graph of field dependencies
        # For now, we return fields in original order
        return [f.name for f in fields]

formula_engine = FormulaEngine()
