import sys
import os
sys.path.append(os.getcwd())
print("Importing app...")
try:
    print("Importing fastapi...")
    from fastapi import FastAPI
    print("Importing app.api.routes...")
    from app.api.routes import router
    print("App imported successfully!")
except Exception as e:
    print(f"Error importing app: {e}")
    import traceback
    traceback.print_exc()
