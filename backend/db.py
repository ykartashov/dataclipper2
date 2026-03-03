"""Supabase client (service role) for backend operations."""
import os

from supabase import create_client, Client

_client: Client | None = None


def get_supabase() -> Client:
    """Get Supabase client with service role (bypasses RLS)."""
    global _client
    if _client is None:
        supabase_url = os.environ.get("SUPABASE_URL", "")
        supabase_service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
        if not supabase_url or not supabase_service_role_key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        _client = create_client(supabase_url, supabase_service_role_key)
    return _client
