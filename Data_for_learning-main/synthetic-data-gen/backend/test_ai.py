import requests

url = "http://localhost:8000/api/v1/ai/generate-schema"
payload = {"prompt": ""}

print("Sending request to /ai/generate-schema...")
try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
