from faker import Faker
from .base import FieldGenerator, registry
from typing import Any, Dict
from datetime import datetime, timedelta

fake = Faker()

class DateGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        start_date = config.get("min", "-30y")
        end_date = config.get("max", "now")
        fmt = config.get("format", "%Y-%m-%d")
        
        d = fake.date_between(start_date=start_date, end_date=end_date)
        return d.strftime(fmt)

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "min": {"type": "string", "default": "-30y"},
            "max": {"type": "string", "default": "now"},
            "format": {"type": "string", "default": "%Y-%m-%d"}
        }

class DateTimeGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        fmt = config.get("format", "%Y-%m-%dT%H:%M:%S")
        dt = fake.date_time()
        return dt.strftime(fmt)

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "format": {"type": "string", "default": "%Y-%m-%dT%H:%M:%S"}
        }

class TimestampGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        ms = config.get("milliseconds", False)
        ts = fake.unix_time()
        return ts * 1000 if ms else ts

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "milliseconds": {"type": "boolean", "default": False}
        }

class TimeGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        fmt = config.get("format", "%H:%M:%S")
        t = fake.time()
        # fake.time returns a string already, but we might want to reformat
        return t

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "format": {"type": "string", "default": "%H:%M:%S"}
        }

class DateBetweenGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        relative = config.get("relative", "last_30_days")
        fmt = config.get("format", "%Y-%m-%d")
        
        if relative == "last_30_days":
            d = fake.date_between(start_date="-30d", end_date="now")
        elif relative == "next_year":
            d = fake.date_between(start_date="now", end_date="+1y")
        else:
            d = fake.date_this_century()
            
        return d.strftime(fmt)

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "relative": {"type": "string", "enum": ["last_30_days", "next_year", "this_century"], "default": "last_30_days"},
            "format": {"type": "string", "default": "%Y-%m-%d"}
        }

# Registering
registry.register("date", DateGenerator())
registry.register("datetime", DateTimeGenerator())
registry.register("timestamp", TimestampGenerator())
registry.register("time", TimeGenerator())
registry.register("date_between", DateBetweenGenerator())
