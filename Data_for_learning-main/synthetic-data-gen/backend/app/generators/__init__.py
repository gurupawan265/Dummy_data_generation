from .base import registry
from . import personal, numeric, datetime, text, location, identifiers, categorical, formula_generator, timeseries, nlp
from .formula_generator import FormulaGenerator

registry.register("formula", FormulaGenerator())

__all__ = ["registry"]
