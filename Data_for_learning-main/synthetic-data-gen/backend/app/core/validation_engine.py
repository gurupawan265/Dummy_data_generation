import pandas as pd
import numpy as np
import re
from typing import List, Dict, Any, Optional

class ValidationEngine:
    def validate(self, df: pd.DataFrame, schema: Any) -> Dict[str, Any]:
        """
        Run validation rules on the dataframe.
        Returns a report with violation counts and details.
        """
        report = {
            "is_valid": True,
            "summary": {},
            "errors": []
        }
        
        for field in schema.fields:
            if not hasattr(field, "validation") or not field.validation:
                continue
                
            rules = field.validation.get("rules", [])
            field_errors = 0
            
            for rule in rules:
                rule_type = rule.get("type")
                params = rule.get("params", {})
                
                if rule_type == "email":
                    invalid_mask = df[field.name].map(lambda x: not self._is_valid_email(str(x)) if x else False)
                elif rule_type == "range":
                    min_val = params.get("min")
                    max_val = params.get("max")
                    invalid_mask = (df[field.name] < min_val) | (df[field.name] > max_val)
                elif rule_type == "unique":
                    invalid_mask = df[field.name].duplicated(keep=False)
                elif rule_type == "regex":
                    pattern = params.get("pattern", ".*")
                    invalid_mask = df[field.name].map(lambda x: not bool(re.match(pattern, str(x))) if x else False)
                else:
                    invalid_mask = pd.Series([False] * len(df))
                
                error_count = invalid_mask.sum()
                if error_count > 0:
                    field_errors += error_count
                    report["is_valid"] = False
                    report["errors"].append({
                        "field": field.name,
                        "rule": rule_type,
                        "count": int(error_count)
                    })
            
            report["summary"][field.name] = {
                "total": len(df),
                "invalid": int(field_errors)
            }
            
        return report

    def _is_valid_email(self, email: str) -> bool:
        return bool(re.match(r"[^@]+@[^@]+\.[^@]+", email))

validation_engine = ValidationEngine()
