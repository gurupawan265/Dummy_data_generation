from faker import Faker
from .base import FieldGenerator, registry
from typing import Any, Dict

fake = Faker()

class CityGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        return fake.city()

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {}

class StateGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        return fake.state()

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {}

class CountryGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        return fake.country()

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {}

class ZipCodeGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        return fake.postcode()

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {}

class CoordinatesGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        precision = config.get("precision", 6)
        lat = fake.latitude()
        lng = fake.longitude()
        return f"{round(float(lat), precision)}, {round(float(lng), precision)}"

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "precision": {"type": "integer", "default": 6}
        }

class AddressGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        return fake.address()

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {}

# Registering
registry.register("city", CityGenerator())
registry.register("state", StateGenerator())
registry.register("country", CountryGenerator())
registry.register("zip_code", ZipCodeGenerator())
registry.register("coordinates", CoordinatesGenerator())
registry.register("address", AddressGenerator())
