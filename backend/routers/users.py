"""Users routes: list (admin only)."""
from fastapi import APIRouter, Depends

from auth import require_admin
from db import get_supabase

router = APIRouter(prefix="/users", tags=["users"])


@router.get("")
def list_users(claims: dict = Depends(require_admin)):
    """List all users with roles. Admin only."""
    supabase = get_supabase()
    resp = supabase.table("users_with_roles").select("id, email, role").execute()
    return {"users": resp.data or []}
