"""Invitations routes: create (admin only)."""
import os
from uuid import uuid4

from fastapi import APIRouter, Depends

from auth import get_user_id, require_admin
from db import get_supabase

router = APIRouter(prefix="/invitations", tags=["invitations"])


@router.post("")
def create_invitation(claims: dict = Depends(require_admin)):
    """Create invitation, return invite link. Admin only."""
    supabase = get_supabase()
    admin_id = get_user_id(claims)

    token = uuid4()
    supabase.table("invitations").insert(
        {"token": str(token), "created_by": str(admin_id)}
    ).execute()

    base_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    invite_link = f"{base_url.rstrip('/')}/invite?token={token}"
    return {"invite_link": invite_link, "token": str(token)}
