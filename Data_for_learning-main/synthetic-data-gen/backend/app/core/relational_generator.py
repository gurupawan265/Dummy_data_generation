import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple
from app.core.schema import SchemaDefinition, SingleTableSchemaDefinition
from app.core.pipeline import DataPipeline
from app.core.relationship_manager import relationship_manager

class RelationalGenerator:
    def __init__(self, pipeline: DataPipeline):
        self.pipeline = pipeline

    def generate(self, schema: SchemaDefinition) -> Tuple[Dict[str, pd.DataFrame], Dict[str, Any]]:
        """
        Generate data for multiple tables, maintaining referential integrity.
        Returns (data_map, validation_reports).
        """
        table_ids = [t.id for t in schema.tables]
        generation_order = relationship_manager.get_generation_order(table_ids, schema.relationships)
        
        results: Dict[str, pd.DataFrame] = {}
        reports: Dict[str, Any] = {}
        table_map = {t.id: t for t in schema.tables}
        
        for table_id in generation_order:
            table_def = table_map[table_id]
            row_count = schema.row_counts.get(table_id, 100)
            
            single_schema = SingleTableSchemaDefinition(
                fields=table_def.fields,
                row_count=row_count,
                seed=schema.seed
            )
            
            # 1. Run pipeline
            df, report = self.pipeline.run(single_schema)
            
            # 2. Referential Integrity
            child_rels = [r for r in schema.relationships if r.child_table == table_id]
            for rel in child_rels:
                parent_df = results.get(rel.parent_table)
                if parent_df is not None and not parent_df.empty:
                    # If parent doesn't have the specified PK, fallback to index
                    if rel.parent_pk in parent_df.columns:
                        parent_pks = parent_df[rel.parent_pk].values
                    else:
                        # Fallback: create a dummy ID array or use index
                        parent_pks = [f"id_{i}" for i in range(len(parent_df))]
                    
                    # Always populate or create the child FK column
                    df[rel.child_fk] = np.random.choice(parent_pks, size=len(df), replace=True)
            
            results[table_id] = df
            reports[table_map[table_id].name] = report
            
        final_results = {table_map[tid].name: df for tid, df in results.items()}
        return final_results, reports

relational_generator = RelationalGenerator
