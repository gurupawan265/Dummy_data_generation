from faker import Faker
import rstr
from .base import FieldGenerator, registry
from typing import Any, Dict

fake = Faker()

class SentenceGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        nb_words = config.get("word_count", 10)
        return fake.sentence(nb_words=nb_words)

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "word_count": {"type": "integer", "default": 10}
        }

class ParagraphGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        nb_sentences = config.get("sentence_count", 5)
        return fake.paragraph(nb_sentences=nb_sentences)

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "sentence_count": {"type": "integer", "default": 5}
        }

class LoremIpsumGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        nb_paragraphs = config.get("paragraph_count", 3)
        return "\n\n".join(fake.paragraphs(nb=nb_paragraphs))

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "paragraph_count": {"type": "integer", "default": 3}
        }

class WordGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        capitalize = config.get("capitalize", False)
        word = fake.word()
        return word.capitalize() if capitalize else word

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "capitalize": {"type": "boolean", "default": False}
        }

class TextPatternGenerator(FieldGenerator):
    def generate(self, config: Dict[str, Any]) -> Any:
        pattern = config.get("pattern", r"[A-Z]{3}-\d{4}")
        return rstr.xresstr(pattern)

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "pattern": {"type": "string", "default": r"[A-Z]{3}-\d{4}"}
        }

# Registering
registry.register("sentence", SentenceGenerator())
registry.register("paragraph", ParagraphGenerator())
registry.register("lorem_ipsum", LoremIpsumGenerator())
registry.register("word", WordGenerator())
registry.register("text_pattern", TextPatternGenerator())
