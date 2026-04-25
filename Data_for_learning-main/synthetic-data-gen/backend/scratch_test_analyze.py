import requests
import json

url = "http://localhost:8000/api/v1/ai/analyze"
payload = {
    "schema_def": {
        "name": "Users",
        "fields": [
            {"name": "id", "type": "uuid"},
            {"name": "age", "type": "integer"}
        ]
    },
    "data": [
        {"id": "1", "age": 25},
        {"id": "2", "age": 30}
    ]
}

print(f"Sending request to {url}...")
try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
