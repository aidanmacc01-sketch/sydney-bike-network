#!/usr/bin/env python3
"""
MICRO2MOVE SYDNEY - Data Fetching & Transformation Script

Fetches cycling data from open data sources and transforms it
into the app's data model format.

Usage:
    python fetch_data.py

Requirements:
    pip install requests pandas geopandas shapely
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import math

try:
    import requests
    import pandas as pd
except ImportError:
    print("Installing required packages...")
    os.system("pip install requests pandas")
    import requests
    import pandas as pd

# Try to import geopandas (optional, for better GeoJSON handling)
try:
    import geopandas as gpd
    HAS_GEOPANDAS = True
except ImportError:
    HAS_GEOPANDAS = False
    print("Note: geopandas not installed. Using basic JSON parsing.")
    print("      For better results: pip install geopandas")

# ============================================
# CONFIGURATION
# ============================================

class Config:
    # City of Sydney Cycle Network - ArcGIS Feature Server
    CYCLE_NETWORK_URL = "https://services1.arcgis.com/cNVyNtjGVZybOQWZ/ArcGIS/rest/services/Cycle_network/FeatureServer/0/query"

    # Alternative: Direct GeoJSON endpoint
    CYCLE_NETWORK_GEOJSON = "https://data.cityofsydney.nsw.gov.au/api/explore/v2.1/catalog/datasets/cycle-network/exports/geojson"

    # TfNSW Cycling Count Data
    CYCLING_COUNT_URL = "https://opendata.transport.nsw.gov.au/dataset/cycling-count"

    # Pop-up cycleways
    POPUP_CYCLEWAY_URL = "https://data.nsw.gov.au/data/api/3/action/package_show?id=sydney-region-pop-up-cycleway"

    # Output directories
    SCRIPT_DIR = Path(__file__).parent
    OUTPUT_DIR = SCRIPT_DIR.parent / "data"
    JS_DIR = SCRIPT_DIR.parent / "js"

    # City of Sydney LGA bounds
    SYDNEY_LGA_BOUNDS = {
        "xmin": 151.17,
        "ymin": -33.92,
        "xmax": 151.25,
        "ymax": -33.84
    }

# ============================================
# LOCAL AREA BOUNDARIES
# ============================================

LOCAL_AREAS = [
    {"name": "Sydney CBD", "bounds": {"minLat": -33.875, "maxLat": -33.860, "minLng": 151.200, "maxLng": 151.215}},
    {"name": "Surry Hills", "bounds": {"minLat": -33.895, "maxLat": -33.875, "minLng": 151.205, "maxLng": 151.220}},
    {"name": "Darlinghurst", "bounds": {"minLat": -33.885, "maxLat": -33.870, "minLng": 151.215, "maxLng": 151.230}},
    {"name": "Redfern", "bounds": {"minLat": -33.900, "maxLat": -33.885, "minLng": 151.195, "maxLng": 151.210}},
    {"name": "Pyrmont", "bounds": {"minLat": -33.875, "maxLat": -33.860, "minLng": 151.185, "maxLng": 151.200}},
    {"name": "Ultimo", "bounds": {"minLat": -33.885, "maxLat": -33.875, "minLng": 151.190, "maxLng": 151.205}},
    {"name": "Glebe", "bounds": {"minLat": -33.885, "maxLat": -33.870, "minLng": 151.175, "maxLng": 151.190}},
    {"name": "Newtown", "bounds": {"minLat": -33.905, "maxLat": -33.890, "minLng": 151.175, "maxLng": 151.190}},
    {"name": "Chippendale", "bounds": {"minLat": -33.890, "maxLat": -33.880, "minLng": 151.195, "maxLng": 151.205}},
    {"name": "Waterloo", "bounds": {"minLat": -33.910, "maxLat": -33.895, "minLng": 151.200, "maxLng": 151.215}},
    {"name": "Alexandria", "bounds": {"minLat": -33.915, "maxLat": -33.900, "minLng": 151.185, "maxLng": 151.205}},
    {"name": "Haymarket", "bounds": {"minLat": -33.885, "maxLat": -33.878, "minLng": 151.200, "maxLng": 151.210}},
    {"name": "Woolloomooloo", "bounds": {"minLat": -33.875, "maxLat": -33.865, "minLng": 151.215, "maxLng": 151.230}},
    {"name": "Potts Point", "bounds": {"minLat": -33.875, "maxLat": -33.865, "minLng": 151.220, "maxLng": 151.235}},
    {"name": "Erskineville", "bounds": {"minLat": -33.905, "maxLat": -33.895, "minLng": 151.185, "maxLng": 151.195}},
]

# ============================================
# DATA FETCHING
# ============================================

def fetch_cycle_network() -> Optional[dict]:
    """Fetch cycle network from City of Sydney ArcGIS Feature Server."""
    print("📡 Fetching City of Sydney Cycle Network...")

    # Try ArcGIS Feature Server first
    params = {
        "where": "1=1",
        "outFields": "*",
        "f": "geojson",
        "outSR": "4326",
    }

    try:
        response = requests.get(Config.CYCLE_NETWORK_URL, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()

        if "features" in data:
            print(f"✅ Fetched {len(data['features'])} features from ArcGIS")
            return data

    except Exception as e:
        print(f"⚠️ ArcGIS fetch failed: {e}")

    # Try alternative GeoJSON endpoint
    print("📡 Trying alternative endpoint...")
    try:
        response = requests.get(Config.CYCLE_NETWORK_GEOJSON, timeout=30)
        response.raise_for_status()
        data = response.json()

        if "features" in data:
            print(f"✅ Fetched {len(data['features'])} features from GeoJSON endpoint")
            return data

    except Exception as e:
        print(f"⚠️ GeoJSON fetch failed: {e}")

    return None


def fetch_popup_cycleways() -> Optional[List[str]]:
    """Fetch list of pop-up cycleway street names."""
    print("📡 Fetching pop-up cycleway data...")

    try:
        response = requests.get(Config.POPUP_CYCLEWAY_URL, timeout=30)
        response.raise_for_status()
        data = response.json()

        # Extract street names from the dataset
        # This will depend on the actual data structure
        if data.get("success") and data.get("result"):
            resources = data["result"].get("resources", [])
            for resource in resources:
                if resource.get("format", "").lower() in ["geojson", "json"]:
                    res_url = resource.get("url")
                    if res_url:
                        res_response = requests.get(res_url, timeout=30)
                        res_data = res_response.json()
                        # Extract street names
                        streets = set()
                        for feature in res_data.get("features", []):
                            props = feature.get("properties", {})
                            street = props.get("STREETNAME") or props.get("street_name") or props.get("name")
                            if street:
                                streets.add(street.upper())
                        print(f"✅ Found {len(streets)} pop-up cycleway streets")
                        return list(streets)

    except Exception as e:
        print(f"⚠️ Pop-up cycleway fetch failed: {e}")

    # Fallback: known pop-up cycleways in Sydney
    return [
        "OXFORD STREET", "MOORE PARK ROAD", "HENDERSON ROAD",
        "BRIDGE ROAD", "PITT STREET", "CASTLEREAGH STREET"
    ]


# ============================================
# DATA TRANSFORMATION
# ============================================

def map_facility_type(props: dict) -> str:
    """Map source data facility type to app's facility type."""
    type_fields = ["FACILITY_TYPE", "FACILITYTYPE", "TYPE", "CYCLEWAY_TYPE",
                   "BIKE_FACILITY", "facility_type", "type", "infrastructure"]

    type_str = ""
    for field in type_fields:
        if field in props and props[field]:
            type_str = str(props[field]).lower()
            break

    # Map to our facility types
    if any(x in type_str for x in ["separated", "protected", "segregated", "off-road cycleway"]):
        return "separated_cycleway"
    if any(x in type_str for x in ["painted", "on-road", "marked lane", "bicycle lane"]):
        return "painted_lane"
    if any(x in type_str for x in ["shared", "path", "shared path", "mixed use"]):
        return "shared_path"

    return "mixed_traffic"


def calculate_comfort_score(facility_type: str, props: dict) -> float:
    """Calculate comfort score based on facility type and attributes."""
    base_scores = {
        "separated_cycleway": 0.85,
        "shared_path": 0.75,
        "painted_lane": 0.55,
        "mixed_traffic": 0.30
    }

    score = base_scores.get(facility_type, 0.5)

    # Adjust for width if available
    width = 0
    for field in ["WIDTH", "LANE_WIDTH", "width", "lane_width"]:
        if field in props and props[field]:
            try:
                width = float(props[field])
                break
            except (ValueError, TypeError):
                pass

    if width >= 3:
        score += 0.05
    elif width >= 2:
        score += 0.02
    elif 0 < width < 1.5:
        score -= 0.1

    return min(1.0, max(0.0, score))


def calculate_risk_score(facility_type: str, props: dict) -> float:
    """Calculate risk score based on facility type."""
    base_risk = {
        "separated_cycleway": 0.15,
        "shared_path": 0.20,
        "painted_lane": 0.45,
        "mixed_traffic": 0.65
    }

    return base_risk.get(facility_type, 0.5)


def get_coordinates(geometry: dict) -> List[dict]:
    """Extract coordinates from geometry, handling various formats."""
    if not geometry:
        return []

    geom_type = geometry.get("type", "")
    coords = geometry.get("coordinates", [])

    if not coords:
        return []

    # Handle different geometry types
    if geom_type == "LineString":
        return [{"lat": c[1], "lng": c[0]} for c in coords]
    elif geom_type == "MultiLineString":
        # Flatten to first line segment
        if coords and coords[0]:
            return [{"lat": c[1], "lng": c[0]} for c in coords[0]]
    elif geom_type == "Point":
        return [{"lat": coords[1], "lng": coords[0]}]

    return []


def calculate_center(coordinates: List[dict]) -> dict:
    """Calculate center point of coordinates."""
    if not coordinates:
        return {"lat": -33.8688, "lng": 151.2093}

    mid_idx = len(coordinates) // 2
    return coordinates[mid_idx] if coordinates else coordinates[0]


def determine_local_area(center: dict) -> str:
    """Determine local area based on center coordinates."""
    lat = center.get("lat", 0)
    lng = center.get("lng", 0)

    for area in LOCAL_AREAS:
        bounds = area["bounds"]
        if (bounds["minLat"] <= lat <= bounds["maxLat"] and
            bounds["minLng"] <= lng <= bounds["maxLng"]):
            return area["name"]

    return "City of Sydney"


def is_popup_cycleway(props: dict, popup_streets: List[str]) -> bool:
    """Check if segment is a pop-up cycleway."""
    # Check properties for popup indicators
    props_str = json.dumps(props).lower()
    if "pop-up" in props_str or "popup" in props_str or "temporary" in props_str:
        return True

    # Check against known popup streets
    street_name = ""
    for field in ["STREETNAME", "STREET", "NAME", "street_name", "street", "name"]:
        if field in props and props[field]:
            street_name = str(props[field]).upper()
            break

    return street_name in popup_streets


def generate_tags(facility_type: str, props: dict, is_popup: bool) -> List[str]:
    """Generate tags for segment."""
    tags = []

    if facility_type == "separated_cycleway":
        tags.append("family_friendly")

    if is_popup:
        tags.append("pop_up_lane")

    props_str = json.dumps(props).lower()
    if "school" in props_str:
        tags.append("school_zone")
    if "station" in props_str or "train" in props_str:
        tags.append("near_station")
    if "park" in props_str:
        tags.append("green_space")

    return tags


def transform_feature(feature: dict, index: int, popup_streets: List[str]) -> dict:
    """Transform a single GeoJSON feature to app segment format."""
    props = feature.get("properties", {})
    geometry = feature.get("geometry", {})

    # Get facility type
    facility_type = map_facility_type(props)

    # Get coordinates
    coordinates = get_coordinates(geometry)
    center = calculate_center(coordinates)

    # Determine if popup
    is_popup = is_popup_cycleway(props, popup_streets)

    # Get road name
    road_name = "Unknown"
    for field in ["STREETNAME", "STREET", "NAME", "street_name", "street", "name", "road_name"]:
        if field in props and props[field]:
            road_name = str(props[field])
            break

    # Get object ID
    obj_id = props.get("OBJECTID") or props.get("FID") or props.get("id") or index

    return {
        "id": f"seg_{obj_id}",
        "road_name": road_name,
        "local_area": determine_local_area(center),
        "facility_type": facility_type,
        "is_pop_up_cycleway": is_popup,
        "speed_env_kmh": 50,  # Default
        "lane_width_m": 0,  # Would need from data
        "gradient_class": "flat",  # Would need elevation data
        "lighting_quality": "unknown",
        "heavy_loading_zone": False,
        "has_bike_counts": False,
        "daily_bike_trips": None,
        "popularity_score": 0.5,
        "crash_risk_score": calculate_risk_score(facility_type, props),
        "comfort_score": calculate_comfort_score(facility_type, props),
        "perceived_safety_score": calculate_comfort_score(facility_type, props) * 0.9,
        "avg_user_rating": None,
        "rating_count": 0,
        "tags": generate_tags(facility_type, props, is_popup),
        "coordinates": coordinates,
        "center": center,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }


def transform_to_segments(geojson_data: dict, popup_streets: List[str]) -> List[dict]:
    """Transform GeoJSON data to app segment format."""
    print("🔄 Transforming data to app format...")

    features = geojson_data.get("features", [])
    if not features:
        print("❌ No features to transform")
        return []

    segments = []
    for i, feature in enumerate(features):
        try:
            segment = transform_feature(feature, i, popup_streets)
            if segment["coordinates"]:  # Only include if has valid coordinates
                segments.append(segment)
        except Exception as e:
            print(f"⚠️ Error transforming feature {i}: {e}")

    print(f"✅ Transformed {len(segments)} segments")
    return segments


# ============================================
# FILE OPERATIONS
# ============================================

def ensure_output_dirs():
    """Create output directories if they don't exist."""
    Config.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"📁 Output directory: {Config.OUTPUT_DIR}")


def save_json(filename: str, data: any):
    """Save data to JSON file."""
    filepath = Config.OUTPUT_DIR / filename
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"💾 Saved: {filepath}")


def load_local_geojson(filename: str) -> Optional[dict]:
    """Load GeoJSON from local file."""
    filepath = Config.OUTPUT_DIR / filename
    if filepath.exists():
        print(f"📂 Loading local file: {filepath}")
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return None


def generate_js_data_file(segments: List[dict]):
    """Generate JavaScript data file for the app."""
    js_content = f"""/**
 * MICRO2MOVE SYDNEY - Generated Data
 *
 * Auto-generated from City of Sydney Open Data
 * Generated: {datetime.now().isoformat()}
 * Segments: {len(segments)}
 */

const SEGMENTS = {json.dumps(segments, indent=2)};

// Keep original sample POIs and Events for now
// These would be populated from your backend

// Export for use in app
if (typeof module !== 'undefined') {{
  module.exports = {{ SEGMENTS }};
}}
"""

    filepath = Config.JS_DIR / "data-generated.js"
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"💾 Generated JS data file: {filepath}")


# ============================================
# STATISTICS
# ============================================

def print_statistics(segments: List[dict]):
    """Print summary statistics."""
    print("\n📊 Summary Statistics:")
    print(f"   Total segments: {len(segments)}")

    # Count by facility type
    type_counts = {}
    for seg in segments:
        ft = seg["facility_type"]
        type_counts[ft] = type_counts.get(ft, 0) + 1

    print("\n   By facility type:")
    for ft, count in sorted(type_counts.items()):
        pct = (count / len(segments)) * 100
        print(f"   - {ft}: {count} ({pct:.1f}%)")

    # Count by local area
    area_counts = {}
    for seg in segments:
        area = seg["local_area"]
        area_counts[area] = area_counts.get(area, 0) + 1

    print("\n   By local area:")
    for area, count in sorted(area_counts.items(), key=lambda x: -x[1])[:10]:
        print(f"   - {area}: {count}")

    # Pop-up cycleways
    popup_count = sum(1 for seg in segments if seg["is_pop_up_cycleway"])
    print(f"\n   Pop-up cycleways: {popup_count}")

    # Comfort score distribution
    comfort_scores = [seg["comfort_score"] for seg in segments]
    avg_comfort = sum(comfort_scores) / len(comfort_scores) if comfort_scores else 0
    print(f"\n   Average comfort score: {avg_comfort:.2f}")


# ============================================
# MAIN
# ============================================

def main():
    print("")
    print("🚴 MICRO2MOVE SYDNEY - Data Fetcher (Python)")
    print("=" * 50)
    print("")

    ensure_output_dirs()

    # Fetch popup cycleway streets
    popup_streets = fetch_popup_cycleways() or []

    # Try to fetch from API
    geojson_data = fetch_cycle_network()

    # If API fails, try loading local file
    if not geojson_data:
        print("\n📂 Attempting to load from local file...")
        geojson_data = load_local_geojson("cycle-network-raw.geojson")

    if not geojson_data:
        print("")
        print("❌ No data available. Please:")
        print("   1. Download the GeoJSON from City of Sydney Data Hub")
        print("   2. Save it as: app/data/cycle-network-raw.geojson")
        print("   3. Run this script again")
        print("")
        print("   Download URL:")
        print("   https://data.cityofsydney.nsw.gov.au/datasets/cityofsydney::cycle-network-3")
        print("")
        sys.exit(1)

    # Save raw data
    save_json("cycle-network-raw.geojson", geojson_data)

    # Transform to app format
    segments = transform_to_segments(geojson_data, popup_streets)

    if not segments:
        print("❌ No segments generated")
        sys.exit(1)

    # Save transformed data
    save_json("segments.json", segments)

    # Generate JS data file
    generate_js_data_file(segments)

    # Print statistics
    print_statistics(segments)

    print("")
    print("✅ Data processing complete!")
    print("")
    print("📁 Output files:")
    print(f"   - {Config.OUTPUT_DIR / 'segments.json'}")
    print(f"   - {Config.JS_DIR / 'data-generated.js'}")
    print("")
    print("💡 Next steps:")
    print("   1. Review the generated data")
    print("   2. Update app/js/data.js to import data-generated.js")
    print("   3. Add cycling count data to populate daily_bike_trips")
    print("")


if __name__ == "__main__":
    main()
