import os
from dotenv import load_dotenv
from google import genai

load_dotenv(override=True)
api_key = os.getenv("GOOGLE_API_KEY")
print(f"Using API Key: {api_key[:10]}...")

try:
    client = genai.Client(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = client.models.generate_content(model='gemini-2.5-flash', contents="Say hello")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
