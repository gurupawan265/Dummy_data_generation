import os
import json
import random
from google import genai
from .base import FieldGenerator, registry
from typing import Any, Dict, List

class NLPTextGenerator(FieldGenerator):
    category = "NLP"
    description = "AI-powered text generation (Sentiment, Intent, etc.)"
    
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self._client = None
        if self.api_key:
            self._client = genai.Client(api_key=self.api_key)

    def generate(self, config: Dict[str, Any]) -> Any:
        if not hasattr(self, '_client'):
            return "LLM API Key not configured."
            
        task = config.get("task", "sentiment")
        domain = config.get("domain", "general")
        tone = config.get("tone", "neutral")
        label = config.get("__context_label__", "neutral") # Can be passed from a label field
        
        prompt = f"""
        Generate a single short sentence for a {task} dataset.
        Domain: {domain}
        Tone: {tone}
        Label: {label}
        
        Return ONLY the sentence text.
        """
        
        try:
            response = self._client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
            return response.text.strip()
        except:
            return "Error generating text."

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {
            "task": {"type": "string", "enum": ["sentiment", "intent", "summarization", "review"], "default": "sentiment"},
            "domain": {"type": "string", "enum": ["general", "medical", "legal", "tech", "finance"], "default": "general"},
            "tone": {"type": "string", "enum": ["neutral", "professional", "casual", "angry", "happy"], "default": "neutral"}
        }

class NERGenerator(FieldGenerator):
    category = "NLP"
    description = "Generates text with Named Entity Recognition tags"
    
    def generate(self, config: Dict[str, Any]) -> Any:
        entities = ["ORGNIZATION", "PERSON", "LOCATION", "DATE"]
        words = ["Apple", "is", "hiring", "engineers", "in", "Cupertino", "since", "January"]
        tags = ["B-ORG", "O", "O", "O", "O", "B-LOC", "O", "B-DATE"]
        return " ".join([f"{w}/{t}" for w, t in zip(words, tags)])

    def validate_config(self, config: Dict[str, Any]) -> bool:
        return True

    @property
    def config_schema(self) -> Dict[str, Any]:
        return {}

# Registering
registry.register("nlp_text", NLPTextGenerator())
registry.register("nlp_ner", NERGenerator())
