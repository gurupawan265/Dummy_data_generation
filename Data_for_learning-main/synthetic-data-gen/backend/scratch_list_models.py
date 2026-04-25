import os
from dotenv import load_dotenv
from google import genai

load_dotenv(override=True)
api_key = os.getenv("GOOGLE_API_KEY")

try:
    client = genai.Client(api_key=api_key)
    print("Available models:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error: {e}")
