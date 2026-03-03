"""Users routes: list and role management (admin only)."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import require_admin
from db import get_supabase

router = APIRouter(prefix="/users", tags=["users"])


class UpdateRoleBody(BaseModel):
    role: str


@router.get("")
def list_users(claims: dict = Depends(require_admin)):
    """List all users with roles. Admin only."""
    supabase = get_supabase()
    resp = supabase.table("users_with_roles").select("id, email, role").execute()
    data = getattr(resp, "data", None) if resp else None
    return {"users": data or []}


@router.patch("/{user_id}/role")
def update_user_role(user_id: str, body: UpdateRoleBody, claims: dict = Depends(require_admin)):
    """Promote/demote users by updating app role. Admin only."""
    if body.role not in {"user", "admin"}:
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")

    supabase = get_supabase()
    existing = (
        supabase.table("user_roles")
        .select("user_id, role")
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    existing_data = getattr(existing, "data", None) if existing else None
    if not existing_data:
        raise HTTPException(status_code=404, detail="User role record not found")

    supabase.table("user_roles").update({"role": body.role}).eq("user_id", user_id).execute()
    return {"ok": True, "user_id": user_id, "role": body.role}
