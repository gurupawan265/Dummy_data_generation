import numpy as np
import pandas as pd
from typing import Optional
from app.core.schema import NoiseConfig

class NoiseInjector:
    @staticmethod
    def apply(df: pd.DataFrame, field_name: str, config: NoiseConfig) -> pd.Series:
        series = df[field_name].copy()
        
        # Dispatch noise based on type

        if config.type == "gaussian":
            return NoiseInjector._apply_gaussian(series, config.intensity)
        elif config.type == "uniform":
            return NoiseInjector._apply_uniform(series, config.intensity)
        elif config.type == "outliers":
            return NoiseInjector._apply_outliers(series, config.intensity)
        elif config.type == "flip":
            return NoiseInjector._apply_categorical_flip(series, config.intensity)
        elif config.type == "rounding":
            return NoiseInjector._apply_rounding(series, config.intensity)
        elif config.type == "corruption":
            return NoiseInjector._apply_corruption(series, config.intensity)
        
        return series

    @staticmethod
    def _apply_categorical_flip(series: pd.Series, intensity: float) -> pd.Series:
        # intensity is percentage of values to flip
        count = int(len(series) * intensity)
        if count == 0: return series
        indices = np.random.choice(series.index, size=count, replace=False)
        categories = series.unique()
        if len(categories) < 2: return series
        
        flips = []
        for val in series.loc[indices]:
            new_val = np.random.choice([c for c in categories if c != val])
            flips.append(new_val)
        series.loc[indices] = flips
        return series

    @staticmethod
    def _apply_rounding(series: pd.Series, intensity: float) -> pd.Series:
        # intensity 0.1 -> round to 1 decimal, 1.0 -> round to 0 decimal
        decimals = 0 if intensity >= 0.5 else 1
        return series.round(decimals)

    @staticmethod
    def _apply_corruption(series: pd.Series, intensity: float) -> pd.Series:
        # intensity is percentage of strings to corrupt
        count = int(len(series) * intensity)
        if count == 0: return series
        indices = np.random.choice(series.index, size=count, replace=False)
        chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
        
        corrupted = []
        for val in series.loc[indices]:
            s = list(str(val))
            if len(s) == 0: 
                corrupted.append(val)
                continue
            idx = np.random.randint(0, len(s))
            s[idx] = np.random.choice(list(chars))
            corrupted.append("".join(s))
        series.loc[indices] = corrupted
        return series

    @staticmethod
    def _apply_gaussian(series: pd.Series, intensity: float) -> pd.Series:
        # Intensity 0-20% means std_dev of noise is intensity * std_dev of values
        std = series.std()
        if pd.isna(std) or std == 0:
            std = series.mean() * 0.1 if series.mean() != 0 else 1.0
            
        noise = np.random.normal(0, intensity * std, size=len(series))
        return series + noise

    @staticmethod
    def _apply_uniform(series: pd.Series, intensity: float) -> pd.Series:
        # Intensity 0-20% means noise is +/- intensity * value
        noise = np.random.uniform(-intensity, intensity, size=len(series))
        return series * (1 + noise)

    @staticmethod
    def _apply_outliers(series: pd.Series, percentage: float) -> pd.Series:
        # intensity here is treated as percentage (0-0.1)
        count = int(len(series) * percentage)
        if count == 0:
            return series
            
        indices = np.random.choice(series.index, size=count, replace=False)
        mean = series.mean()
        std = series.std()
        
        if pd.isna(std) or std == 0:
            std = mean * 0.1 if mean != 0 else 1.0

        # Outliers at 3-5 sigma
        outlier_values = []
        for _ in range(count):
            sigma = np.random.uniform(3, 5)
            direction = np.random.choice([-1, 1])
            outlier_values.append(mean + direction * sigma * std)
            
        series.loc[indices] = outlier_values
        return series

noise_injector = NoiseInjector()
