"""
Micro2Move Sydney — FastAPI Backend
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import auth, users
from services.vertex_ai import init_gemini, generate_route_insight, refine_route
from pydantic import BaseModel
from typing import Optional

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,   # hide Swagger in prod
    redoc_url="/redoc" if settings.DEBUG else None,
)

# ---------------------------------------------------------------------------
# CORS — restrict to known origins in production
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(auth.router)
app.include_router(users.router)

# ---------------------------------------------------------------------------
# Legacy / existing routes (kept from original main.py)
# ---------------------------------------------------------------------------


class RouteRequest(BaseModel):
    start_location: str = "Circular Quay, Sydney"
    description: str = ""
    scenery: str = ""
    utilities: str = ""
    distance_km: int = 25
    ride_type: str = "commute"
    safety_priority: int = 90
    shade_priority: int = 50
    hills_avoid: int = 20


class RefineRequest(BaseModel):
    current_route: dict = {}
    refinement_prompt: str = ""
    safety_vs_direct: int = 75
    shade_vs_speed: int = 30


@app.on_event("startup")
async def startup() -> None:
    if settings.GEMINI_API_KEY:
        init_gemini()
        logger.info("Gemini AI initialised")
    logger.info("Micro2Move backend started — %s", settings.APP_NAME)


@app.get("/api/health", tags=["system"])
async def health() -> dict:
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}


@app.post("/api/v1/routes/generate", tags=["routes"])
async def generate_route(request: RouteRequest):
    from fastapi import HTTPException
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Gemini API not configured")
    return await generate_route_insight(
        start_location=request.start_location,
        description=request.description,
        scenery=request.scenery,
        utilities=request.utilities,
        distance_km=request.distance_km,
        ride_type=request.ride_type,
        safety_priority=request.safety_priority,
        shade_priority=request.shade_priority,
        hills_avoid=request.hills_avoid,
    )


@app.post("/api/v1/routes/refine", tags=["routes"])
async def refine_route_endpoint(request: RefineRequest):
    from fastapi import HTTPException
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Gemini API not configured")
    return await refine_route(
        current_route=request.current_route,
        refinement_prompt=request.refinement_prompt,
        safety_vs_direct=request.safety_vs_direct,
        shade_vs_speed=request.shade_vs_speed,
    )


# ---------------------------------------------------------------------------
# Entry point (local dev only)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
