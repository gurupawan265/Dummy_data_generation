from faker import Faker
from .base import FieldGenerator, registry
from typing import Any, Dict, List, Optional

fake = Faker()

class NameGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        subtype = config.get("subtype", "full_name")
        if subtype == "first_name":
            return fake.first_name()
        elif subtype == "last_name":
            return fake.last_name()
        elif subtype == "prefix":
            return fake.prefix()
        elif subtype == "suffix":
            return fake.suffix()
        if subtype == "NONE":
            return None # Or a reasonable default
        return fake.name()

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "subtype": {
                "type": "string",
                "enum": ["NONE", "full_name", "first_name", "last_name", "prefix", "suffix"],
                "default": "full_name"
            }
        }

class EmailGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        domains = config.get("domains")
        if domains:
            return f"{fake.user_name()}@{fake.random_element(domains)}"
        return fake.email()

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "domains": {"type": "array", "items": {"type": "string"}, "optional": True}
        }

class PhoneGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        # Simplified for now, can be expanded for specific countries
        format_str = config.get("format", "###-###-####")
        return fake.numerify(format_str)

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "format": {"type": "string", "default": "###-###-####"}
        }

class AddressGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        subtype = config.get("subtype", "full_address")
        if subtype == "street":
            return fake.street_address()
        elif subtype == "city":
            return fake.city()
        elif subtype == "state":
            return fake.state()
        elif subtype == "zip":
            return fake.postcode()
        elif subtype == "country":
            return fake.country()
        if subtype == "NONE":
            return None
        return fake.address()

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "subtype": {
                "type": "string",
                "enum": ["NONE", "full_address", "street", "city", "state", "zip", "country"],
                "default": "full_address"
            }
        }

class SSNGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        return fake.ssn()

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {}

# Registering
registry.register("name", NameGenerator())
registry.register("email", EmailGenerator())
registry.register("phone", PhoneGenerator())
registry.register("address", AddressGenerator())
registry.register("ssn", SSNGenerator())
