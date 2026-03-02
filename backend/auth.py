"""Auth utilities: JWT validation and dependency injection."""
import os
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
INITIAL_ADMIN_EMAIL = os.environ.get("INITIAL_ADMIN_EMAIL", "")

security = HTTPBearer(auto_error=False)


def get_token_claims(credentials: HTTPAuthorizationCredentials | None) -> dict | None:
    """Validate Supabase JWT and return payload, or None if no/invalid token."""
    if not credentials or not credentials.credentials:
        return None
    if not JWT_SECRET:
        return None
    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except jwt.InvalidTokenError:
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
    """Dependency: require admin role, raise 403 if not admin."""
    role = claims.get("user_role")
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
