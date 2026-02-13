"""
Micro2Move Sydney - FastAPI Backend
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from config import settings
from services.vertex_ai import init_gemini, generate_route_insight, refine_route

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

# CORS - allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
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


# Startup
@app.on_event("startup")
async def startup():
    if settings.GEMINI_API_KEY:
        init_gemini()


# Health check
@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}


# AI Route Generation
@app.post("/api/v1/routes/generate")
async def generate_route(request: RouteRequest):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Gemini API not configured. Set GEMINI_API_KEY in .env")

    result = await generate_route_insight(
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
    return result


# AI Route Refinement
@app.post("/api/v1/routes/refine")
async def refine_route_endpoint(request: RefineRequest):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Gemini API not configured. Set GEMINI_API_KEY in .env")

    result = await refine_route(
        current_route=request.current_route,
        refinement_prompt=request.refinement_prompt,
        safety_vs_direct=request.safety_vs_direct,
        shade_vs_speed=request.shade_vs_speed,
    )
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
