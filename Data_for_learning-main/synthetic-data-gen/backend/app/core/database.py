import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(override=True)

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://YOUR-PROJECT.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SECRET_KEY")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Failed to initialize Supabase client: {e}")
    supabase = None
