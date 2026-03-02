"""Auth routes: me, complete-invite."""
import os
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from auth import get_user_id, require_auth
from db import get_supabase

router = APIRouter(prefix="/auth", tags=["auth"])
INITIAL_ADMIN_EMAIL = os.environ.get("INITIAL_ADMIN_EMAIL", "").strip().lower()


class CompleteInviteBody(BaseModel):
    invite_token: str


@router.get("/me")
def get_me(claims: dict = Depends(require_auth)):
    """Return current user profile and role."""
    supabase = get_supabase()
    user_id = get_user_id(claims)
    email = claims.get("email") or ""
    role_resp = (
        supabase.table("user_roles")
        .select("role")
        .eq("user_id", str(user_id))
        .maybe_single()
        .execute()
    )
    role = role_resp.data.get("role") if role_resp.data else None
    return {
        "id": str(user_id),
        "email": email,
        "role": role,
    }


@router.post("/complete-invite")
def complete_invite(
    body: CompleteInviteBody,
    claims: dict = Depends(require_auth),
):
    """Consume invite token, create user_roles, mark invitation used. Idempotent."""
    invite_token = body.invite_token
    if not invite_token:
        raise HTTPException(status_code=400, detail="invite_token required")

    try:
        token_uuid = UUID(invite_token)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid invite_token format")

    supabase = get_supabase()
    user_id = get_user_id(claims)
    email = (claims.get("email") or "").strip().lower()

    # Check if user already has a role (idempotent)
    existing = (
        supabase.table("user_roles")
        .select("role")
        .eq("user_id", str(user_id))
        .maybe_single()
        .execute()
    )
    if existing.data:
        return {"ok": True, "role": existing.data["role"]}

    # Fetch invitation
    inv_resp = (
        supabase.table("invitations")
        .select("id, used_at")
        .eq("token", str(token_uuid))
        .maybe_single()
        .execute()
    )
    if not inv_resp.data:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if inv_resp.data.get("used_at"):
        raise HTTPException(status_code=400, detail="Invitation already used")

    # Assign role: admin if INITIAL_ADMIN_EMAIL matches, else user
    role = "admin" if email and email == INITIAL_ADMIN_EMAIL else "user"

    supabase.table("user_roles").insert(
        {"user_id": str(user_id), "role": role}
    ).execute()

    from datetime import datetime, timezone

    supabase.table("invitations").update(
        {"used_by": str(user_id), "used_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", inv_resp.data["id"]).execute()

    return {"ok": True, "role": role}
