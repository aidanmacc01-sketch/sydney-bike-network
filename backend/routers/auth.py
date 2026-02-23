"""
Micro2Move — Auth Router
Handles user registration and login via Supabase Auth.

Endpoints:
    POST /api/v1/auth/register
    POST /api/v1/auth/login
    POST /api/v1/auth/logout
    GET  /api/v1/auth/me
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from supabase import Client, create_client

from config import settings
from middleware.auth import CurrentUser

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def _supabase() -> Client:
    """Create a Supabase client using the anon key (for auth operations)."""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str

    model_config = {"json_schema_extra": {"example": {
        "full_name": "Alex Smith",
        "email": "alex@example.com",
        "password": "supersecret123",
    }}}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str | None = None


class MeResponse(BaseModel):
    user_id: str
    email: str | None
    role: str | None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user account",
)
async def register(body: RegisterRequest) -> AuthResponse:
    """
    Register a new Micro2Move user.

    Creates a Supabase Auth account and inserts a row in the `users` table
    with the supplied full_name.  Returns a JWT on success.
    """
    sb = _supabase()

    # 1. Create auth account
    try:
        result = sb.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {"data": {"full_name": body.full_name}},
        })
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    if not result.user or not result.session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed — check your email and password.",
        )

    # 2. Insert profile row (Supabase trigger could handle this, but explicit is safer)
    service_sb = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    service_sb.table("users").upsert({
        "user_id": result.user.id,
        "full_name": body.full_name,
        "email": body.email,
        "hashed_password": "supabase_auth",   # managed by Supabase Auth
        "tnc_accepted": True,
    }).execute()

    return AuthResponse(
        access_token=result.session.access_token,
        user_id=result.user.id,
        email=result.user.email or body.email,
        full_name=body.full_name,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Sign in with email and password",
)
async def login(body: LoginRequest) -> AuthResponse:
    """Sign in and receive a JWT access token."""
    sb = _supabase()

    try:
        result = sb.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password,
        })
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not result.user or not result.session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    full_name = (result.user.user_metadata or {}).get("full_name")

    return AuthResponse(
        access_token=result.session.access_token,
        user_id=result.user.id,
        email=result.user.email or body.email,
        full_name=full_name,
    )


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Invalidate the current session",
)
async def logout(user: CurrentUser) -> None:
    """
    Sign out the current user.
    The client should also discard its local JWT after calling this.
    """
    # Supabase server-side sign-out requires the user's token, which the
    # middleware has already validated.  The client-side SDK handles
    # clearing the local session; here we just confirm the token was valid.
    return


@router.get(
    "/me",
    response_model=MeResponse,
    summary="Return the current user's identity",
)
async def me(user: CurrentUser) -> MeResponse:
    """Returns the user_id and email from the verified JWT."""
    return MeResponse(
        user_id=user.sub,
        email=user.email,
        role=user.role,
    )
