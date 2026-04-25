from typing import Any, Protocol, runtime_checkable
import pandas as pd
from app.core.schema import FieldConfig, SchemaDefinition

@runtime_checkable
class GenerationContext(Protocol):
    seed: int | None
    generated_data: dict[str, list[Any]]

@runtime_checkable
class Generator(Protocol):
    def generate(self, field: FieldConfig, count: int, context: GenerationContext) -> list[Any]:
        ...

    def supports(self, field_type: str) -> bool:
        ...

@runtime_checkable
class Validator(Protocol):
    def validate(self, schema: SchemaDefinition) -> dict[str, Any]:
        ...

@runtime_checkable
class Exporter(Protocol):
    def export(self, df: pd.DataFrame) -> bytes:
        ...

    @property
    def format_name(self) -> str:
        ...
