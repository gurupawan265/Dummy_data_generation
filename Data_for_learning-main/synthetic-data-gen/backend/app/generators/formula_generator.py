from app.generators.base import BaseGenerator
from typing import Any, Dict, List

class FormulaGenerator(BaseGenerator):
    """
    Placeholder generator for formula fields.
    Real logic happens in the DataPipeline stage 5.5.
    """
    def __init__(self):
        super().__init__(
            display_name="Formula",
            type="formula",
            category="Calculated",
            config_schema={
                "formula": {
                    "type": "string",
                    "default": "price * 1.1",
                    "description": "Expression using other field names. e.g. quantity * price"
                }
            }
        )

    def generate(self, config: Dict[str, Any]) -> Any:
        return None

    def generate_batch(self, config: Dict[str, Any], count: int) -> List[Any]:
        # Return empty list, Pipeline will overwrite this
        return [None] * count

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return "formula" in config
