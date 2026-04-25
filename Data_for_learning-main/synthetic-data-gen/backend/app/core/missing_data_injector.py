import numpy as np
import pandas as pd
from typing import List, Optional, Any
from app.core.schema import MissingDataConfig

class MissingDataInjector:
    @staticmethod
    def apply(df: pd.DataFrame, field_name: str, config: MissingDataConfig) -> pd.Series:
        series = df[field_name].copy()
        
        if config.type == "random": # MCAR
            return MissingDataInjector._apply_mcar(series, config.percentage)
        elif config.type == "block":
            return MissingDataInjector._apply_block(series, config.percentage, config.block_size_range)
        elif config.type == "mar" or config.type == "structural":
            return MissingDataInjector._apply_mar(df, field_name, config.percentage, config.condition)
        elif config.type == "mnar":
            return MissingDataInjector._apply_mnar(series, config.percentage, config.target_value_range)
            
        return series

    @staticmethod
    def _apply_mar(df: pd.DataFrame, field_name: str, percentage: float, condition: Optional[str]) -> pd.Series:
        series = df[field_name].copy()
        if not condition:
            return series
            
        try:
            # Get mask of rows satisfying the condition
            mask = df.eval(condition)
            eligible_indices = df.index[mask].tolist()
            
            if not eligible_indices:
                return series
                
            # Calculate how many to nullify within the eligible subset
            num_to_null = int(len(eligible_indices) * percentage)
            if num_to_null == 0 and percentage > 0:
                num_to_null = 1
                
            null_indices = np.random.choice(eligible_indices, size=min(num_to_null, len(eligible_indices)), replace=False)
            series.loc[null_indices] = None
        except Exception as e:
            print(f"MAR/Structural error for {field_name}: {e}")
            
        return series

    @staticmethod
    def _apply_mnar(series: pd.Series, percentage: float, target_range: Optional[List[Any]]) -> pd.Series:
        if not target_range:
            return series
            
        try:
            if len(target_range) == 2 and all(isinstance(x, (int, float)) for x in target_range):
                # Numeric range
                low, high = target_range
                mask = (series >= low) & (series <= high)
            else:
                # Categorical list
                mask = series.isin(target_range)
                
            eligible_indices = series.index[mask].tolist()
            
            if not eligible_indices:
                return series
                
            num_to_null = int(len(eligible_indices) * percentage)
            if num_to_null == 0 and percentage > 0:
                num_to_null = 1
                
            null_indices = np.random.choice(eligible_indices, size=min(num_to_null, len(eligible_indices)), replace=False)
            series.loc[null_indices] = None
        except Exception as e:
            print(f"MNAR error: {e}")
            
        return series

    @staticmethod
    def _apply_mcar(series: pd.Series, percentage: float) -> pd.Series:
        mask = np.random.choice([True, False], size=len(series), p=[percentage, 1 - percentage])
        series.loc[mask] = None
        return series

    @staticmethod
    def _apply_block(series: pd.Series, percentage: float, block_size_range: List[int]) -> pd.Series:
        total_missing = int(len(series) * percentage)
        if total_missing == 0:
            return series
            
        current_missing = 0
        min_size, max_size = block_size_range
        
        while current_missing < total_missing:
            # Pick a random block size
            size = np.random.randint(min_size, max_size + 1)
            # Adjust if we would exceed total_missing
            size = min(size, total_missing - current_missing)
            
            # Pick a start index
            start_idx = np.random.randint(0, len(series) - size + 1)
            
            # Apply block
            series.iloc[start_idx : start_idx + size] = None
            current_missing += size
            
        return series

missing_data_injector = MissingDataInjector()
