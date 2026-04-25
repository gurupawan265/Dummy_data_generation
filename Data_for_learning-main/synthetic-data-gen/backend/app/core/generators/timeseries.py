import numpy as np
import pandas as pd
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta

def generate_time_series(
    n_points: int,
    start_date: Optional[str] = None,
    frequency: str = 'H',
    trend: float = 0.0, # Per step
    seasonality_period: Optional[int] = None,
    seasonality_amplitude: float = 0.0,
    noise_level: float = 0.1,
    drift_slope: float = 0.0,
    anomalies: List[Dict[str, Any]] = []
) -> pd.DataFrame:
    """
    Generates a realistic time series with trend, seasonality, noise, and anomalies.
    """
    if start_date:
        start_dt = pd.to_datetime(start_date)
    else:
        start_dt = datetime.now() - timedelta(hours=n_points)

    timestamps = pd.date_range(start=start_dt, periods=n_points, freq=frequency)
    t = np.arange(n_points)
    
    # 1. Base Trend (Linear)
    series = t * trend
    
    # 2. Seasonality (Sine wave)
    if seasonality_period:
        series += seasonality_amplitude * np.sin(2 * np.pi * t / seasonality_period)
        
    # 3. Drift (Gradual change in slope/mean)
    series += (t**2) * drift_slope
    
    # 4. Noise
    series += np.random.normal(0, noise_level, n_points)
    
    # 5. Anomalies
    for anomaly in anomalies:
        idx = anomaly.get('index')
        if idx and 0 <= idx < n_points:
            mag = anomaly.get('magnitude', 5.0)
            series[idx] += mag
            
    return pd.DataFrame({
        'timestamp': timestamps,
        'value': series
    })

class TimeSeriesGenerator:
    def __init__(self):
        self.name = "time_series"
        self.category = "Scientific"
        self.description = "Generates sequential data with trend and seasonality"
        self.config_schema = {
            "trend": {"type": "number", "default": 0.01, "description": "Linear growth per step"},
            "seasonality_period": {"type": "integer", "default": 24, "description": "Steps per cycle (e.g., 24 for daily in hourly data)"},
            "seasonality_amplitude": {"type": "number", "default": 2.0, "description": "Height of the seasonal wave"},
            "noise_level": {"type": "number", "default": 0.5, "description": "Standard deviation of random noise"},
            "anomaly_rate": {"type": "number", "default": 0.02, "description": "Probability of a spike anomaly"}
        }

    def generate(self, count: int, config: Dict[str, Any]) -> List[float]:
        t = np.arange(count)
        trend = config.get("trend", 0.01)
        period = config.get("seasonality_period", 24)
        amp = config.get("seasonality_amplitude", 2.0)
        noise = config.get("noise_level", 0.5)
        anomaly_rate = config.get("anomaly_rate", 0.02)

        series = t * trend
        if period > 0:
            series += amp * np.sin(2 * np.pi * t / period)
        
        series += np.random.normal(0, noise, count)
        
        # Add random spikes
        anomalies = np.random.random(count) < anomaly_rate
        series[anomalies] += np.random.choice([-1, 1], size=np.sum(anomalies)) * (amp * 3)
        
        return series.tolist()
