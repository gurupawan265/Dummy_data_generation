import pandas as pd
import numpy as np
import logging
from typing import Any, Dict, List, Optional, Union
from app.core.schema import SchemaDefinition, FieldConfig, SingleTableSchemaDefinition
from app.core.distributions import distribution_gen
from app.core.noise_injector import noise_injector
from app.core.missing_data_injector import missing_data_injector
from app.core.formula_engine import formula_engine
from app.core.validation_engine import validation_engine
from app.core.correlation_engine import correlation_engine
from app.core.constraint_engine import constraint_engine

logger = logging.getLogger(__name__)

class DataPipeline:
    def __init__(self, registry):
        self.registry = registry

    def run(self, schema: Union[SchemaDefinition, SingleTableSchemaDefinition]) -> Any:
        """
        Orchestrate the 6-stage generation pipeline:
        1. Base Generation
        2. Distribution Application
        3. Noise Injection (Placeholder)
        4. Missing Value Injection (Placeholder)
        5. Validation
        6. Formatting
        """
        row_count = schema.row_count
        seed = schema.seed
        
        if seed is not None:
            np.random.seed(seed)

        data = {}
        
        # STAGE 1 & 2: Base Generation & Distributions
        for field in schema.fields:
            # 1. Base generation
            gen = self.registry.get_generator(field.type)
            if not gen:
                logger.warning(f"Generator '{field.type}' not found. Falling back to 'word'.")
                gen = self.registry.get_generator("word")
                if not gen:
                    raise ValueError("Critical error: fallback 'word' generator missing.")
            
            # Inject field ID for increment/counters
            field_config = {**field.config, "__field_id__": field.id}
            
            # 2. Distribution Application
            if field.distribution:
                is_numeric = field.type in ["integer", "float", "currency", "percentage"]
                if is_numeric or field.distribution.type == "categorical":
                    values = self._apply_distribution(field, row_count)
                else:
                    values = gen.generate_batch(field_config, row_count)
            else:
                values = gen.generate_batch(field_config, row_count)
            
            data[field.name] = values

        df = pd.DataFrame(data)

        # STAGE 3: Noise Injection (Placeholder)
        df = self._inject_noise(df, schema)

        # STAGE 3.5: Advanced Semantics (Correlations & Constraints)
        df = self._apply_semantics(df, schema)

        # STAGE 4: Missing Value Injection (Placeholder)
        df = self._inject_missing_values(df, schema)

        # STAGE 5.5: Formulas
        df = self._apply_formulas(df, schema)

        # STAGE 5: Validation
        report = self._validate_data(df, schema)

        # STAGE 6: Formatting
        df = self._format_data(df, schema)

        return df, report

    def _apply_distribution(self, field: FieldConfig, count: int) -> List[Any]:
        """Stage 2: Apply statistical distributions to numeric fields"""
        dist = field.distribution
        params = dist.params
        
        if dist.type == "normal":
            vals = distribution_gen.normal(count, params.get("mean", 0), params.get("std_dev", 1))
        elif dist.type == "uniform":
            vals = distribution_gen.uniform(count, params.get("min", 0), params.get("max", 1))
        elif dist.type == "exponential":
            vals = distribution_gen.exponential(count, params.get("lambda", 1))
        elif dist.type == "skewed":
            vals = distribution_gen.skewed(count, params.get("direction", "right"), params.get("factor", 0.5))
        elif dist.type == "categorical":
            categories = params.get("categories", ["A", "B", "C"])
            probabilities = params.get("probabilities", [0.33, 0.33, 0.34])
            vals = distribution_gen.categorical(count, categories, probabilities)
        else:
            # Fallback if unknown
            return []

        if field.type == "integer":
            return vals.astype(int).tolist()
        return vals.tolist()

    def _inject_noise(self, df: pd.DataFrame, schema: Union[SchemaDefinition, SingleTableSchemaDefinition]) -> pd.DataFrame:
        """Stage 3: Inject noise into numeric fields"""
        for field in schema.fields:
            if field.noise:
                df[field.name] = noise_injector.apply(df, field.name, field.noise)
        return df

    def _inject_missing_values(self, df: pd.DataFrame, schema: Union[SchemaDefinition, SingleTableSchemaDefinition]) -> pd.DataFrame:
        """Stage 4: Inject missing values (MCAR or Block)"""
        for field in schema.fields:
            if field.missing_data:
                df[field.name] = missing_data_injector.apply(df, field.name, field.missing_data)
            elif field.nullable:
                # Default 5% if nullable but no specific missing_data config
                mask = np.random.choice([True, False], size=len(df), p=[0.05, 0.95])
                df.loc[mask, field.name] = None
        return df

    def _validate_data(self, df: pd.DataFrame, schema: Union[SchemaDefinition, SingleTableSchemaDefinition]) -> Dict[str, Any]:
        """Stage 5: Validate data against constraints"""
        return validation_engine.validate(df, schema)

    def _apply_formulas(self, df: pd.DataFrame, schema: Union[SchemaDefinition, SingleTableSchemaDefinition]) -> pd.DataFrame:
        """Stage 5.5: Evaluate calculated fields"""
        formulas = []
        for field in schema.fields:
            if field.type == "formula" and "formula" in field.config:
                formulas.append({
                    "name": field.name,
                    "expression": field.config["formula"]
                })
        
        if formulas:
            return formula_engine.evaluate(df, formulas)
        return df

    def _format_data(self, df: pd.DataFrame, schema: Union[SchemaDefinition, SingleTableSchemaDefinition]) -> pd.DataFrame:
        """Stage 6: Final formatting (e.g., currency symbols, precision, prefix, suffix)"""
        for field in schema.fields:
            # 1. Type-specific formatting
            if field.type == "currency":
                symbol = field.config.get("symbol", "$")
                if df[field.name].dtype != object:
                   df[field.name] = df[field.name].map(lambda x: f"{symbol}{x:,.2f}" if x is not None else None)
            elif field.type == "percentage":
                decimals = field.config.get("decimals", 2)
                if df[field.name].dtype != object:
                   df[field.name] = df[field.name].map(lambda x: f"{x:,.{decimals}f}%" if x is not None else None)
            
            # 2. Global prefix/suffix
            if field.prefix or field.suffix:
                p = field.prefix or ""
                s = field.suffix or ""
                df[field.name] = df[field.name].map(lambda x: f"{p}{x}{s}" if x is not None else None)
                
        return df

    def _apply_semantics(self, df: pd.DataFrame, schema: Union[SchemaDefinition, SingleTableSchemaDefinition]) -> pd.DataFrame:
        """Apply statistical correlations and logical constraints"""
        # 1. Apply Correlations
        if hasattr(schema, 'correlations') and schema.correlations:
            df = correlation_engine.apply(df, schema.correlations)
        
        # 2. Apply Constraints
        if hasattr(schema, 'constraints') and schema.constraints:
            df = constraint_engine.apply(df, schema.constraints)
            
        return df
