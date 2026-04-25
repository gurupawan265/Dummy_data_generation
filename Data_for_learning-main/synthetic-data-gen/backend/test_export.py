import requests

schema = {
    "table_name": "users",
    "row_count": 5,
    "fields": [
        {
            "name": "id",
            "type": "uuid",
            "blank_percentage": 0,
            "is_required": True,
            "is_primary_key": True,
            "is_foreign_key": False
        },
        {
            "name": "name",
            "type": "word",
            "subtype": "full_name",
            "blank_percentage": 0,
            "is_required": True,
            "is_primary_key": False,
            "is_foreign_key": False
        }
    ]
}

response = requests.post("http://localhost:8000/api/v1/export/csv", json=schema)
print("Status Code:", response.status_code)
if response.status_code == 200:
    print("Content preview:")
    print(response.text[:200])
else:
    print("Error:", response.text)
