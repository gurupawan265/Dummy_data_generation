from typing import Any
import numpy as np
from faker import Faker
from app.core.schema import FieldConfig
from app.core.interfaces import GenerationContext
from app.generators.base import BaseGenerator

class FakerGenerator(BaseGenerator):
    def __init__(self):
        self.faker = Faker()

    def supports(self, field_type: str) -> bool:
        return field_type in ["name", "first_name", "last_name", "email", "phone", "address", "city", "country", "url", "ip_address", "uuid"]

    def generate(self, field: FieldConfig, count: int, context: GenerationContext) -> list[Any]:
        if context.seed is not None:
            Faker.seed(context.seed)
        
        method_map = {
            "name": self.faker.name,
            "first_name": self.faker.first_name,
            "last_name": self.faker.last_name,
            "email": self.faker.email,
            "phone": self.faker.phone_number,
            "address": self.faker.address,
            "city": self.faker.city,
            "country": self.faker.country,
            "url": self.faker.url,
            "ip_address": self.faker.ipv4,
            "uuid": self.faker.uuid4
        }
        
        func = method_map.get(field.type, self.faker.word)
        return [func() for _ in range(count)]

class NumericGenerator(BaseGenerator):
    def supports(self, field_type: str) -> bool:
        return field_type in ["integer", "float"]

    def generate(self, field: FieldConfig, count: int, context: GenerationContext) -> list[Any]:
        rng = np.random.RandomState(context.seed)
        
        if field.distribution:
            dist_type = field.distribution.type
            if dist_type == "normal":
                values = rng.normal(field.distribution.mean or 0, field.distribution.std or 1, count)
            elif dist_type == "uniform":
                values = rng.uniform(field.distribution.low or 0, field.distribution.high or 1, count)
            elif dist_type == "exponential":
                values = rng.exponential(field.distribution.scale or 1, count)
            else:
                values = rng.rand(count)
        else:
            low = field.constraints.min if field.constraints and field.constraints.min is not None else 0
            high = field.constraints.max if field.constraints and field.constraints.max is not None else 100
            if field.type == "integer":
                values = rng.randint(int(low), int(high) + 1, count)
            else:
                values = rng.uniform(float(low), float(high), count)
        
        if field.type == "integer":
            return [int(v) for v in values]
        return [float(v) for v in values]

class EnumGenerator(BaseGenerator):
    def supports(self, field_type: str) -> bool:
        return field_type == "enum"

    def generate(self, field: FieldConfig, count: int, context: GenerationContext) -> list[Any]:
        if not field.values:
            return [None] * count
        rng = np.random.RandomState(context.seed)
        return list(rng.choice(field.values, size=count, p=field.weights))

class BooleanGenerator(BaseGenerator):
    def supports(self, field_type: str) -> bool:
        return field_type == "boolean"

    def generate(self, field: FieldConfig, count: int, context: GenerationContext) -> list[Any]:
        rng = np.random.RandomState(context.seed)
        return list(rng.choice([True, False], size=count))
