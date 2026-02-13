"""
Micro2Move Sydney - Gemini AI Route Planning Service
"""
from google import genai
import json
from config import settings

client = None


def init_gemini():
    """Initialize Gemini client with API key."""
    global client
    client = genai.Client(api_key=settings.GEMINI_API_KEY)


def get_client():
    """Get the Gemini client, initializing if needed."""
    global client
    if client is None:
        init_gemini()
    return client


async def generate_route_insight(
    start_location: str,
    description: str = "",
    scenery: str = "",
    utilities: str = "",
    distance_km: int = 25,
    ride_type: str = "commute",
    safety_priority: int = 90,
    shade_priority: int = 50,
    hills_avoid: int = 20,
) -> dict:
    """Generate an AI-powered route insight using Gemini."""

    c = get_client()

    prompt = f"""You are a Sydney cycling route AI for the Micro2Move app.
Generate a cycling route recommendation based on these preferences:

- Start: {start_location}
- Target distance: {distance_km}km
- Ride type: {ride_type}
- Scenery preference: {scenery or 'any'}
- Utilities needed: {utilities or 'none specified'}
- Safety priority: {safety_priority}/100
- Shade preference: {shade_priority}/100
- Hills avoidance: {hills_avoid}/100
- User description: {description or 'none'}

Respond in JSON format:
{{
  "insight": "2-3 sentence route description mentioning specific Sydney streets and cycleways",
  "route_name": "Short route name",
  "distance_km": {distance_km},
  "estimated_minutes": <number>,
  "elevation_gain_m": <number>,
  "safety_score": <0-100>,
  "segments": [
    {{
      "name": "Street/cycleway name",
      "distance_km": <number>,
      "type": "protected|shared|mixed",
      "note": "optional note"
    }}
  ],
  "badges": ["badge1", "badge2"],
  "warnings": ["optional warnings"]
}}"""

    response = c.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )
    text = response.text

    # Parse JSON from response
    try:
        # Handle markdown code blocks in response
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        return json.loads(text.strip())
    except (json.JSONDecodeError, IndexError):
        return {
            "insight": text,
            "route_name": f"{start_location} Loop",
            "distance_km": distance_km,
            "estimated_minutes": int(distance_km * 3),
            "elevation_gain_m": 40,
            "safety_score": safety_priority,
            "segments": [],
            "badges": ["AI Generated"],
            "warnings": [],
        }


async def refine_route(
    current_route: dict,
    refinement_prompt: str,
    safety_vs_direct: int = 75,
    shade_vs_speed: int = 30,
) -> dict:
    """Refine an existing route based on user feedback."""

    c = get_client()

    prompt = f"""You are a Sydney cycling route AI for the Micro2Move app.
The user wants to refine their current route.

Current route summary:
- Distance: {current_route.get('distance_km', 'unknown')}km
- Safety: {current_route.get('safety_score', 'unknown')}%
- Segments: {json.dumps(current_route.get('segments', []))}

User's refinement request: "{refinement_prompt}"
Safety vs Directness preference: {safety_vs_direct}/100 (higher = safer)
Shade vs Speed preference: {shade_vs_speed}/100 (higher = more shade)

Respond in the same JSON format as route generation, with updated values reflecting the refinement."""

    response = c.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )
    text = response.text

    try:
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        return json.loads(text.strip())
    except (json.JSONDecodeError, IndexError):
        return {
            "insight": text,
            "route_name": "Refined Route",
            "distance_km": current_route.get("distance_km", 25),
            "estimated_minutes": current_route.get("estimated_minutes", 75),
            "elevation_gain_m": current_route.get("elevation_gain_m", 40),
            "safety_score": min(current_route.get("safety_score", 90) + 5, 100),
            "segments": current_route.get("segments", []),
            "badges": ["AI Refined"],
            "warnings": [],
        }
