"""
Micro2Move — JWT Authentication Middleware
Verifies Supabase-issued JWTs on protected routes.

Usage:
    from middleware.auth import get_current_user, CurrentUser

    @router.get("/protected")
    async def protected(user: CurrentUser):
        return {"user_id": user.id}
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import ExpiredSignatureError, JWTError, jwt
from pydantic import BaseModel

from config import settings

_bearer = HTTPBearer(auto_error=False)


class TokenPayload(BaseModel):
    """Decoded Supabase JWT payload fields we care about."""

    sub: str          # Supabase user UUID
    email: str | None = None
    role: str | None = None


def _decode_token(token: str) -> TokenPayload:
    """
    Verify and decode a Supabase JWT.

    Supabase signs JWTs with a symmetric HS256 key (SUPABASE_JWT_SECRET),
    found at: Supabase Dashboard → Project Settings → API → JWT Secret.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},  # Supabase JWTs have no aud claim
        )
        return TokenPayload(**payload)
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> TokenPayload:
    """FastAPI dependency — returns decoded token or raises 401."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _decode_token(credentials.credentials)


# Convenience type alias for use in route signatures
CurrentUser = Annotated[TokenPayload, Depends(get_current_user)]
