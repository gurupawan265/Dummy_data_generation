import os
import sys
sys.path.append(os.getcwd())
from app.core.database import supabase
from app.core.export_service import export_service
import pandas as pd

print(f"Supabase client: {supabase}")
df = pd.DataFrame({"test": [1, 2, 3]})

print("Attempting to log pipeline execution...")
export_service.log_pipeline_execution("Test message", "test_schema", "started")
print("Done logging.")

print("Attempting to upload to supabase...")
csv_bytes = export_service.to_csv(df)
url = export_service.upload_to_supabase(csv_bytes, "test_upload.csv", "outputs")
print(f"Upload URL: {url}")
