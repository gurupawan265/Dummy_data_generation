import os
from dotenv import load_dotenv
from google import genai

load_dotenv(override=True)
api_key = os.getenv("GOOGLE_API_KEY")

try:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents='Hello!'
    )
    print("Response:", response.text)
except Exception as e:
    print(f"Error: {e}")
