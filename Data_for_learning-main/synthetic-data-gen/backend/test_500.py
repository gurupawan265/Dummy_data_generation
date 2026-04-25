import requests

url = "http://localhost:8000/api/v1/generate/multi"
payload = {
    "tables": [
        {
            "id": "t1", "name": "Table1",
            "fields": [
                {"id": "f1", "name": "field1", "type": "INVALID_TYPE", "required": True}
            ]
        }
    ],
    "relationships": [],
    "row_counts": {"t1": 5}
}

print("Sending request with invalid type...")
try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
