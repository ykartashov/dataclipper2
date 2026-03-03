"""Auth utilities: JWT validation and dependency injection."""
import logging
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from db import get_supabase

security = HTTPBearer(auto_error=False)
logger = logging.getLogger(__name__)


def get_token_claims(credentials: HTTPAuthorizationCredentials | None) -> dict | None:
    """Validate access token with Supabase and return minimal claims."""
    if not credentials or not credentials.credentials:
        return None

    token = credentials.credentials
    try:
        supabase = get_supabase()
    except RuntimeError as exc:
        # Backend misconfiguration should not look like auth failure.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc

    try:
        user_response = supabase.auth.get_user(token)
        user = getattr(user_response, "user", None)
        if not user:
            logger.warning("Token validation failed: no user returned from Supabase")
            return None
        return {"sub": str(user.id), "email": user.email}
    except Exception as exc:
        logger.warning("Token validation failed: %s", exc)
        return None


def require_auth(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    """Dependency: require valid JWT, raise 401 if missing/invalid."""
    claims = get_token_claims(credentials)
    if not claims:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token",
        )
    return claims


def require_admin(
    claims: dict = Depends(require_auth),
) -> dict:
    """Dependency: require admin role from DB, raise 403 if not admin."""
    user_id = get_user_id(claims)
    supabase = get_supabase()
    role_resp = (
        supabase.table("user_roles")
        .select("role")
        .eq("user_id", str(user_id))
        .maybe_single()
        .execute()
    )
    role = role_resp.data.get("role") if role_resp.data else None
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return claims


def get_user_id(claims: dict) -> UUID:
    """Extract user_id (sub) from JWT claims."""
    sub = claims.get("sub")
    if not sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return UUID(sub)
