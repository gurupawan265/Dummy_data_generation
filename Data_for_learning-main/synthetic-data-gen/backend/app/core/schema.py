from typing import Any, List, Dict, Optional
from pydantic import BaseModel, Field

class DistributionConfig(BaseModel):
    type: str # normal, uniform, exponential
    params: Dict[str, Any] = Field(default_factory=dict)

class NoiseConfig(BaseModel):
    type: str # gaussian, uniform, outliers
    intensity: float = 0.1 # 0-0.2 for noise, or percentage for outliers

class MissingDataConfig(BaseModel):
    type: str # random, block, mar, mnar, structural
    percentage: float = 0.1 # 0-1.0
    block_size_range: List[int] = [3, 8]
    condition: Optional[str] = None # For MAR/Structural (e.g. "age < 18")
    target_value_range: Optional[List[Any]] = None # For MNAR (e.g. [100000, 1000000])

class FieldConfig(BaseModel):
    id: str
    name: str
    type: str # FieldType
    required: bool = True
    nullable: bool = False
    unique: bool = False
    default: Optional[Any] = None
    distribution: Optional[DistributionConfig] = None
    noise: Optional[NoiseConfig] = None
    missing_data: Optional[MissingDataConfig] = None
    prefix: Optional[str] = None
    suffix: Optional[str] = None
    subtype: Optional[str] = None
    validation: Optional[Dict[str, Any]] = None
    config: Dict[str, Any] = Field(default_factory=dict)

class TableDefinition(BaseModel):
    id: str
    name: str
    fields: List[FieldConfig]
    constraints: List[Dict[str, Any]] = Field(default_factory=list)
    correlations: List[Dict[str, Any]] = Field(default_factory=list)

class RelationshipDefinition(BaseModel):
    id: str
    parent_table: str # table id
    parent_pk: str # field name (usually id)
    child_table: str # table id
    child_fk: str # field name (e.g., user_id)
    type: str = "one-to-many"

class SchemaDefinition(BaseModel):
    tables: List[TableDefinition]
    relationships: List[RelationshipDefinition] = Field(default_factory=list)
    row_counts: Dict[str, int] = Field(default_factory=dict) # table_id -> count
    seed: Optional[int] = None

# For backward compatibility if needed in some endpoints, or new single-table fallback
class SingleTableSchemaDefinition(BaseModel):
    fields: List[FieldConfig]
    row_count: int = 100
    seed: Optional[int] = None
    constraints: List[Dict[str, Any]] = Field(default_factory=list)
    correlations: List[Dict[str, Any]] = Field(default_factory=list)

class ValidationResult(BaseModel):
    is_valid: bool
    errors: List[str] = []
