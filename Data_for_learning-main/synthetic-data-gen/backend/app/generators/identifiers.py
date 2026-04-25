import uuid
import string
import random
from .base import FieldGenerator, registry
from typing import Any, Dict

class UUIDGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        version = config.get("version", 4)
        if version == 1:
            return str(uuid.uuid1())
        return str(uuid.uuid4())

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "version": {"type": "integer", "enum": [1, 4], "default": 4}
        }

class NanoIDGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        size = config.get("size", 21)
        alphabet = config.get("alphabet", string.ascii_letters + string.digits)
        return ''.join(random.choices(alphabet, k=size))

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "size": {"type": "integer", "default": 21},
            "alphabet": {"type": "string", "optional": True}
        }

class AutoIncrementGenerator(FieldGenerator):
    def __init__(self):
        self._counters = {}

    def generate(self, config: Dict[str, Any]) -> Any:
        start = config.get("start", 1)
        prefix = config.get("prefix", "")
        padding = config.get("padding", 0)
        field_id = config.get("__field_id__", "default")
        
        val = self._counters.get(field_id, start)
        self._counters[field_id] = val + 1
        
        str_val = str(val).zfill(padding)
        return f"{prefix}{str_val}"

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "start": {"type": "integer", "default": 1},
            "prefix": {"type": "string", "default": ""},
            "padding": {"type": "integer", "default": 0}
        }

# Registering
registry.register("uuid", UUIDGenerator())
registry.register("nanoid", NanoIDGenerator())
registry.register("auto_increment", AutoIncrementGenerator())
