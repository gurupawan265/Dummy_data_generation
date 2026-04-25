import numpy as np
from typing import Any, Dict, List

class DistributionGenerator:
    """Helper class to generate statistical distributions using NumPy"""
    
    @staticmethod
    def normal(size: int, mean: float = 0.0, std_dev: float = 1.0) -> np.ndarray:
        return np.random.normal(loc=mean, scale=max(0.0001, std_dev), size=size)
    
    @staticmethod
    def uniform(size: int, low: float = 0.0, high: float = 1.0) -> np.ndarray:
        return np.random.uniform(low=low, high=high, size=size)
    
    @staticmethod
    def exponential(size: int, lambd: float = 1.0) -> np.ndarray:
        # Scale is 1/lambda
        scale = 1.0 / max(0.0001, lambd)
        return np.random.exponential(scale=scale, size=size)

    @staticmethod
    def skewed(size: int, direction: str = "right", factor: float = 0.5) -> np.ndarray:
        """Generate a skewed distribution using the power-law or similar transformation"""
        # Simple skew implementation using power transform
        base = np.random.uniform(0, 1, size)
        if direction == "right":
            return base ** (1.0 / (1.0 + factor * 5))
        else:
            return 1.0 - (base ** (1.0 / (1.0 + factor * 5)))

    @staticmethod
    def categorical(size: int, categories: List[str], probabilities: List[float]) -> np.ndarray:
        return np.random.choice(categories, size=size, p=probabilities)

    @staticmethod
    def get_preview_data(dist_type: str, params: Dict[str, Any], bins: int = 30) -> List[Dict[str, Any]]:
        """Generate histogram data for frontend visualization"""
        size = 1000
        if dist_type == "normal":
            data = DistributionGenerator.normal(size, params.get("mean", 0), params.get("std_dev", 1))
        elif dist_type == "uniform":
            data = DistributionGenerator.uniform(size, params.get("min", 0), params.get("max", 1))
        elif dist_type == "exponential":
            data = DistributionGenerator.exponential(size, params.get("lambda", 1))
        elif dist_type == "skewed":
            data = DistributionGenerator.skewed(size, params.get("direction", "right"), params.get("factor", 0.5))
        else:
            return []
            
        hist, bin_edges = np.histogram(data, bins=bins, density=True)
        # Convert to format suitable for Recharts
        return [
            {"bin": round((bin_edges[i] + bin_edges[i+1])/2, 2), "value": float(hist[i])}
            for i in range(len(hist))
        ]

distribution_gen = DistributionGenerator()
