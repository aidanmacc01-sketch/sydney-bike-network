"""
Micro2Move — Users Router
Read and update the authenticated user's profile.

Endpoints:
    GET  /api/v1/users/me
    PUT  /api/v1/users/me
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, HttpUrl
from supabase import create_client

from config import settings
from middleware.auth import CurrentUser

router = APIRouter(prefix="/api/v1/users", tags=["users"])


def _service_sb():
    """Supabase client with service-role key for privileged DB access."""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class UserProfile(BaseModel):
    user_id: str
    full_name: str | None
    email: str | None
    avatar_url: str | None
    credits: int
    verified_id: bool

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None

    model_config = {"json_schema_extra": {"example": {
        "full_name": "Alex Smith",
        "phone": "+61 400 000 000",
        "avatar_url": "https://...",
    }}}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.get(
    "/me",
    response_model=UserProfile,
    summary="Get the authenticated user's profile",
)
async def get_my_profile(user: CurrentUser) -> UserProfile:
    """
    Returns the current user's name, credit balance, and ID-verification status.
    """
    sb = _service_sb()
    result = sb.table("users").select(
        "user_id, full_name, email, profile_image_link, credits, verified_id"
    ).eq("user_id", user.sub).maybe_single().execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    row = result.data
    return UserProfile(
        user_id=row["user_id"],
        full_name=row.get("full_name"),
        email=row.get("email"),
        avatar_url=row.get("profile_image_link"),
        credits=row.get("credits", 0),
        verified_id=row.get("verified_id", False),
    )


@router.put(
    "/me",
    response_model=UserProfile,
    summary="Update the authenticated user's profile",
)
async def update_my_profile(
    body: UpdateProfileRequest,
    user: CurrentUser,
) -> UserProfile:
    """
    Update full_name, phone, or avatar_url.
    Only fields that are explicitly provided (non-null) are updated.
    """
    sb = _service_sb()

    updates: dict = {}
    if body.full_name is not None:
        updates["full_name"] = body.full_name.strip()
    if body.avatar_url is not None:
        updates["profile_image_link"] = str(body.avatar_url)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No fields provided to update",
        )

    result = (
        sb.table("users")
        .update(updates)
        .eq("user_id", user.sub)
        .select("user_id, full_name, email, profile_image_link, credits, verified_id")
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    row = result.data[0]
    return UserProfile(
        user_id=row["user_id"],
        full_name=row.get("full_name"),
        email=row.get("email"),
        avatar_url=row.get("profile_image_link"),
        credits=row.get("credits", 0),
        verified_id=row.get("verified_id", False),
    )
