import pandas as pd
import numpy as np
from typing import List, Dict, Any

class CorrelationEngine:
    def apply(self, df: pd.DataFrame, correlations: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Inject correlations between numeric features.
        Formula: feature_2 = (coeff * feature_1_normalized) + ((1 - abs(coeff)) * feature_2_original)
        """
        df_new = df.copy()
        
        # We need to preserve numeric types
        for corr in correlations:
            f1 = corr.get('feature_1')
            f2 = corr.get('feature_2')
            strength = corr.get('strength', 'moderate').lower()
            ctype = corr.get('type', 'positive').lower()
            
            if f1 not in df_new.columns or f2 not in df_new.columns:
                continue
            
            # Only correlate numeric columns
            if not np.issubdtype(df_new[f1].dtype, np.number) or not np.issubdtype(df_new[f2].dtype, np.number):
                continue
                
            coeff_map = {
                'weak': 0.2,
                'moderate': 0.5,
                'strong': 0.8,
                'very-strong': 0.95
            }
            coeff = coeff_map.get(strength, 0.5)
            if ctype == 'negative':
                coeff = -coeff
                
            # Normalize f1 to the distribution of f2
            f1_mean = df_new[f1].mean()
            f1_std = df_new[f1].std()
            if f1_std == 0: continue
            
            f2_mean = df_new[f2].mean()
            f2_std = df_new[f2].std()
            
            # Map f1 values to f2's range
            f1_mapped = ((df_new[f1] - f1_mean) / f1_std) * f2_std + f2_mean
            
            # Blend original f2 with f1-mapped values
            df_new[f2] = (coeff * f1_mapped) + (1 - abs(coeff)) * df_new[f2]
            
            # Clip if needed or preserve type
            if np.issubdtype(df[f2].dtype, np.integer):
                df_new[f2] = df_new[f2].round().astype(int)
                
        return df_new

correlation_engine = CorrelationEngine()
