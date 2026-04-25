import requests
import json

url = "http://localhost:8000/api/v1/generate/multi"
payload = {
    "tables": [
        {
            "id": "users", "name": "Users",
            "fields": [
                {"id": "u1", "name": "id", "type": "integer", "required": True},
                {"id": "u2", "name": "name", "type": "name", "required": True}
            ]
        }
    ],
    "relationships": [],
    "row_counts": {"users": 5},
    "seed": 42
}

print("Sending request to /generate/multi...")
try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
