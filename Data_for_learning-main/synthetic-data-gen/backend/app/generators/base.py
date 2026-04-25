from abc import ABC, abstractmethod
from typing import Any, List, Dict, Optional

class BaseGenerator(ABC):
    """Base class for all field generators"""
    
    def __init__(
        self, 
        display_name: Optional[str] = None, 
        type: Optional[str] = None, 
        category: Optional[str] = None, 
        config_schema: Optional[Dict[str, Any]] = None
    ):
        self.display_name = display_name
        self.type = type
        self.category = category
        self._config_schema = config_schema or {}
    
    @abstractmethod
    def generate(self, config: Dict[str, Any]) -> Any:
        """Generate a single value"""
        pass
    
    @abstractmethod
    def validate_config(self, config: Dict[str, Any]) -> bool:
        """Validate generator configuration"""
        pass
    
    def generate_batch(self, config: Dict[str, Any], count: int) -> List[Any]:
        """Generate multiple values (can be overridden for performance)"""
        return [self.generate(config) for _ in range(count)]
    
    @property
    def config_schema(self) -> Dict[str, Any]:
        """JSON schema for configuration options"""
        return self._config_schema

# Alias for backward compatibility
FieldGenerator = BaseGenerator

class GeneratorRegistry:
    def __init__(self):
        self._generators: Dict[str, BaseGenerator] = {}

    def register(self, name: str, generator: BaseGenerator):
        self._generators[name] = generator

    def get_generator(self, name: str) -> Optional[BaseGenerator]:
        return self._generators.get(name)

    def list_generators(self) -> Dict[str, Dict[str, Any]]:
        return {
            name: {
                "name": name,
                "category": getattr(gen, "category", None) or "Other",
                "description": getattr(gen, "description", ""),
                "config_schema": gen.config_schema
            } for name, gen in self._generators.items()
        }

# Global registry instance
registry = GeneratorRegistry()
