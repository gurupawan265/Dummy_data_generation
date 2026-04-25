import numpy as np
import random
from .base import FieldGenerator, registry
from typing import Any, Dict

class IntegerGenerator(FieldGenerator):
    category = "Numeric"
    description = "Random integer within a range"
    def generate(self, config: Dict[str, Any]) -> Any:
        min_val = config.get("min", 0)
        max_val = config.get("max", 100)
        step = config.get("step", 1)
        dist = config.get("distribution", "uniform")
        
        if dist == "normal":
            mean = (min_val + max_val) / 2
            std = (max_val - min_val) / 6
            val = int(np.random.normal(mean, std))
            return max(min_val, min(max_val, val))
        
        return random.randrange(min_val, max_val + 1, step)

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "min": {"type": "integer", "default": 0},
            "max": {"type": "integer", "default": 100},
            "step": {"type": "integer", "default": 1},
            "distribution": {"type": "string", "enum": ["uniform", "normal"], "default": "uniform"}
        }

class FloatGenerator(FieldGenerator):
    category = "Numeric"
    description = "Random floating-point number"
    def generate(self, config: Dict[str, Any]) -> Any:
        min_val = config.get("min", 0.0)
        max_val = config.get("max", 1.0)
        precision = config.get("precision", 2)
        dist = config.get("distribution", "uniform")

        if dist == "normal":
            mean = (min_val + max_val) / 2
            std = (max_val - min_val) / 6
            val = np.random.normal(mean, std)
            return round(max(min_val, min(max_val, val)), precision)

        return round(random.uniform(min_val, max_val), precision)

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "min": {"type": "number", "default": 0.0},
            "max": {"type": "number", "default": 1.0},
            "precision": {"type": "integer", "default": 2},
            "distribution": {"type": "string", "enum": ["uniform", "normal"], "default": "uniform"}
        }

class CurrencyGenerator(FieldGenerator):
    category = "Numeric"
    description = "Formatted currency value"
    def generate(self, config: Dict[str, Any]) -> Any:
        min_val = config.get("min", 0.0)
        max_val = config.get("max", 1000.0)
        symbol = config.get("symbol", "$")
        val = random.uniform(min_val, max_val)
        return f"{symbol}{val:.2f}"

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "min": {"type": "number", "default": 0.0},
            "max": {"type": "number", "default": 1000.0},
            "symbol": {"type": "string", "default": "$"}
        }

class PercentageGenerator(FieldGenerator):
    category = "Numeric"
    description = "Percentage value"
    def generate(self, config: Dict[str, Any]) -> Any:
        min_val = config.get("min", 0.0)
        max_val = config.get("max", 100.0)
        decimals = config.get("decimals", 2)
        val = random.uniform(min_val, max_val)
        return f"{val:.{decimals}f}%"

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "min": {"type": "number", "default": 0.0},
            "max": {"type": "number", "default": 100.0},
            "decimals": {"type": "integer", "default": 2}
        }

class IncrementGenerator(FieldGenerator):
    category = "Numeric"
    description = "Auto-incrementing integer"
    def __init__(self):
        self._counters = {}

    def generate(self, config: Dict[str, Any]) -> Any:
        start = config.get("start", 1)
        step = config.get("step", 1)
        field_id = config.get("__field_id__", "default")
        self._counters[field_id] = self._counters.get(field_id, start - step) + step
        return self._counters[field_id]

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "start": {"type": "integer", "default": 1},
            "step": {"type": "integer", "default": 1}
        }

class RandomChoiceGenerator(FieldGenerator):
    category = "Misc"
    description = "Random pick from a list of options"
    def generate(self, config: Dict[str, Any]) -> Any:
        options = config.get("options", ["A", "B", "C"])
        weights = config.get("weights")
        return random.choices(options, weights=weights, k=1)[0]

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "options": {"type": "array", "items": {"type": "string"}},
            "weights": {"type": "array", "items": {"type": "number"}, "optional": True}
        }

# Registering
registry.register("integer", IntegerGenerator())
registry.register("float", FloatGenerator())
registry.register("currency", CurrencyGenerator())
registry.register("percentage", PercentageGenerator())
registry.register("increment", IncrementGenerator())
registry.register("random_choice", RandomChoiceGenerator())
