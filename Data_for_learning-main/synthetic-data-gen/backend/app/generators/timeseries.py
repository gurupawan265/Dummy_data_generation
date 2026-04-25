import numpy as np
import random
from .base import FieldGenerator, registry
from typing import Any, Dict

class TimeSeriesGenerator(FieldGenerator):
    category = "Time Series"
    description = "Generates sequential data with trend, seasonality, and spikes"
    
    def __init__(self):
        self._steps = {}

    def generate(self, config: Dict[str, Any]) -> Any:
        # Use field_id to maintain sequence state across rows
        field_id = config.get("__field_id__", "default")
        t = self._steps.get(field_id, 0)
        self._steps[field_id] = t + 1
        
        trend = config.get("trend", 0.01)
        period = config.get("seasonality_period", 24)
        amp = config.get("seasonality_amplitude", 2.0)
        noise = config.get("noise_level", 0.5)
        anomaly_rate = config.get("anomaly_rate", 0.01)
        drift = config.get("drift", 0.0) # Quadratic acceleration
        
        # Base trend + Drift
        val = (t * trend) + (0.5 * drift * (t**2))
        
        # Seasonality (Sine Wave)
        if period > 0:
            val += amp * np.sin(2 * np.pi * t / period)
            
        # Random Noise
        val += np.random.normal(0, noise)
        
        # Anomalies (Sudden Spikes)
        if random.random() < anomaly_rate:
            spike_dir = random.choice([-1, 1])
            val += spike_dir * (amp * 4 + noise * 10)
            
        return float(round(val, 4))

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "trend": {"type": "number", "default": 0.01, "description": "Linear growth per step"},
            "drift": {"type": "number", "default": 0.0, "description": "Acceleration (drift over time)"},
            "seasonality_period": {"type": "integer", "default": 24, "description": "Steps per cycle"},
            "seasonality_amplitude": {"type": "number", "default": 2.0, "description": "Peak seasonality value"},
            "noise_level": {"type": "number", "default": 0.5, "description": "Standard deviation of noise"},
            "anomaly_rate": {"type": "number", "default": 0.01, "description": "Probability of a spike"}
        }

class RandomWalkGenerator(FieldGenerator):
    category = "Time Series"
    description = "Generates a random walk (stochastic process)"
    
    def __init__(self):
        self._state = {}

    def generate(self, config: Dict[str, Any]) -> Any:
        field_id = config.get("__field_id__", "default")
        current_val = self._state.get(field_id, config.get("start", 0.0))
        
        step_size = config.get("step_size", 1.0)
        drift = config.get("drift", 0.0)
        
        new_val = current_val + drift + np.random.normal(0, step_size)
        self._state[field_id] = new_val
        
        return float(round(new_val, 4))

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "start": {"type": "number", "default": 0.0},
            "step_size": {"type": "number", "default": 1.0},
            "drift": {"type": "number", "default": 0.0}
        }

# Registering
registry.register("time_series", TimeSeriesGenerator())
registry.register("random_walk", RandomWalkGenerator())
