import random
from .base import FieldGenerator, registry
from typing import Any, Dict

class BooleanGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        prob = config.get("true_probability", 0.5)
        return random.random() < prob

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "true_probability": {"type": "number", "default": 0.5}
        }

class EnumGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        options = config.get("options", ["True", "False", "Maybe"])
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
registry.register("boolean", BooleanGenerator())
registry.register("enum", EnumGenerator())
