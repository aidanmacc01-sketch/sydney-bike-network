# Sydney Bike Waze – Complete Design Specification
## City of Sydney LGA

---

# 1. Wireframes & Screen Descriptions

## 1.1 Mobile Map Screen (Home)

```
┌─────────────────────────────────────────┐
│ ◀ Menu          Sydney Bike Waze    🔍  │
├─────────────────────────────────────────┤
│                                         │
│          ┌───────────────────┐          │
│          │                   │          │
│          │   [MAP CANVAS]    │          │
│          │                   │          │
│          │  ════ Separated   │          │
│          │  ──── Painted     │          │
│          │  ···· Shared      │          │
│          │  ---- Mixed       │          │
│          │                   │          │
│          │    📍 You         │          │
│          │                   │          │
│          └───────────────────┘          │
│                                         │
├─────────────────────────────────────────┤
│  [🗺 Explore]  [🚴 Route]  [⚠️ Report]  │
└─────────────────────────────────────────┘
```

### Visual Specifications

| Element | Specification |
|---------|---------------|
| **Map bounds** | Clipped to City of Sydney LGA boundary |
| **Default zoom** | Level 15 (neighbourhood scale) |
| **Centre point** | User location or Town Hall (-33.8731, 151.2065) |

### Segment Colour Coding

| Facility Type | Base Colour | Comfort Overlay |
|---------------|-------------|-----------------|
| `separated_cycleway` | **#22C55E** (Green) | Opacity: comfort_score × 100% |
| `painted_lane` | **#3B82F6** (Blue) | Opacity: comfort_score × 100% |
| `shared_path` | **#A855F7** (Purple) | Opacity: comfort_score × 100% |
| `mixed_traffic` | **#F97316** (Orange) | Opacity: comfort_score × 100% |

### Map Interaction States

- **Idle**: Segments rendered at 3px stroke
- **Hover/Tap**: Segment highlights to 6px, pulse animation
- **Selected**: Segment detail sheet slides up

### Legend Chip Bar (Bottom of map)

```
[ 🟢 Separated ] [ 🔵 Painted ] [ 🟣 Shared ] [ 🟠 Mixed ]
```

Tapping a chip filters the map to only show that type.

---

## 1.2 Segment Detail Sheet

Slides up from bottom when segment is tapped. Height: 40% of screen (expandable to 85%).

```
┌─────────────────────────────────────────┐
│  ─────  (drag handle)                   │
├─────────────────────────────────────────┤
│                                         │
│  🛤️  Oxford Street Cycleway             │
│  Separated cycleway • Pop-up lane       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  COMFORT        POPULARITY    RISK      │
│  ████████░░     ██████░░░░    ██░░░░░░  │
│  8.2/10         6.1/10        Low       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ℹ️  Details                            │
│  ├─ Speed environment: 40 km/h          │
│  ├─ Lighting: Good 💡                   │
│  ├─ Gradient: Flat                      │
│  └─ Daily trips: ~2,400                 │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ⚠️  Recent Reports                     │
│  ┌──────┐ ┌────────────┐ ┌───────────┐  │
│  │ 🔧   │ │ 🚧         │ │ ✨        │  │
│  │Pothole│ │Construction│ │Good infra │  │
│  │2d ago │ │ 5d ago     │ │ 1w ago    │  │
│  └──────┘ └────────────┘ └───────────┘  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ⭐ Community Rating                    │
│  ★★★★☆  4.2 (127 ratings)              │
│                                         │
│  Tags from riders:                      │
│  [Good at night] [Cargo-friendly]       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [ ⭐ Rate Lane ]    [ ⚠️ Report Issue ] │
│                                         │
└─────────────────────────────────────────┘
```

### Score Bar Visualisation

- **Comfort Score**: Green gradient fill (0=red, 5=yellow, 10=green)
- **Popularity Score**: Blue gradient fill
- **Risk Level**: Text badge with colour
  - Low (0–0.3): Green badge
  - Medium (0.3–0.6): Yellow badge
  - High (0.6–1.0): Red badge

### Report Chips

Each chip is tappable to view full report details:

| Event Type | Icon | Chip Colour |
|------------|------|-------------|
| `glass` | 🔶 | Amber |
| `pothole` | 🔧 | Grey |
| `closed` | 🚫 | Red |
| `construction` | 🚧 | Orange |
| `door_zone_risk` | 🚗 | Red |
| `near_miss` | ⚠️ | Red |
| `good_infra` | ✨ | Green |
| `other` | 📝 | Grey |

---

## 1.3 Reporting Flow

### Step 1: Report Type Selection

```
┌─────────────────────────────────────────┐
│  ◀ Back       Report an Issue           │
├─────────────────────────────────────────┤
│                                         │
│  📍 Oxford Street (near Taylor Square)  │
│                                         │
│  What's happening here?                 │
│                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │   🔶    │  │   🔧    │  │   🚫    │  │
│  │  Glass  │  │ Pothole │  │ Closed  │  │
│  └─────────┘  └─────────┘  └─────────┘  │
│                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │   🚧    │  │   🚗    │  │   ⚠️    │  │
│  │ Works   │  │Door zone│  │Near miss│  │
│  └─────────┘  └─────────┘  └─────────┘  │
│                                         │
│  ┌─────────┐  ┌─────────┐               │
│  │   ✨    │  │   📝    │               │
│  │Good lane│  │  Other  │               │
│  └─────────┘  └─────────┘               │
│                                         │
└─────────────────────────────────────────┘
```

### Step 2: Severity & Details

```
┌─────────────────────────────────────────┐
│  ◀ Back       Report: Pothole           │
├─────────────────────────────────────────┤
│                                         │
│  How bad is it?                         │
│                                         │
│  ○ Low – Minor annoyance                │
│  ◉ Medium – Should be avoided           │
│  ○ High – Dangerous, take care!         │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Add details (optional)                 │
│  ┌─────────────────────────────────────┐│
│  │ Large pothole in the bike lane,     ││
│  │ about 30cm wide near the bus stop.  ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  📸 Add photo                           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│        [ Submit Report 📤 ]             │
│                                         │
│  Your report helps other cyclists!      │
│                                         │
└─────────────────────────────────────────┘
```

### Step 3: Confirmation

```
┌─────────────────────────────────────────┐
│                                         │
│              ✅                         │
│                                         │
│        Thanks, legend!                  │
│                                         │
│   Your report is now live and will      │
│   help riders on Oxford Street.         │
│                                         │
│   [View on map]    [Done]               │
│                                         │
└─────────────────────────────────────────┘
```

---

## 1.4 Routing Options Screen

### Route Input

```
┌─────────────────────────────────────────┐
│  ◀ Back           Plan Route            │
├─────────────────────────────────────────┤
│                                         │
│  From                                   │
│  ┌─────────────────────────────────────┐│
│  │ 📍 Current location                 ││
│  └─────────────────────────────────────┘│
│                                         │
│  To                                     │
│  ┌─────────────────────────────────────┐│
│  │ 🔍 Central Station                  ││
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Route preference                       │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  ⚡ Fastest                         ││
│  │  Shortest time, may include busy    ││
│  │  roads                              ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  🛡️ Safest                  ✓      ││
│  │  Avoids crash hotspots, prefers     ││
│  │  separated lanes                    ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  😌 Most Comfortable                ││
│  │  Flat, well-lit paths with good     ││
│  │  surfaces                           ││
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│                                         │
│           [ Find Routes 🚴 ]            │
│                                         │
└─────────────────────────────────────────┘
```

### Route Results

```
┌─────────────────────────────────────────┐
│  ◀ Back        3 routes found           │
├─────────────────────────────────────────┤
│                                         │
│          ┌───────────────────┐          │
│          │                   │          │
│          │   [MAP CANVAS]    │          │
│          │   showing 3       │          │
│          │   route options   │          │
│          │                   │          │
│          └───────────────────┘          │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  🛡️ RECOMMENDED                         │
│  ┌─────────────────────────────────────┐│
│  │ Via Bourke St Cycleway              ││
│  │ 2.4 km • 12 min                     ││
│  │ 🟢 85% separated  ⭐ 4.5 comfort    ││
│  │ [Start this route →]                ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Via Crown St                        ││
│  │ 2.1 km • 10 min                     ││
│  │ 🟠 40% separated  ⭐ 3.2 comfort    ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Via Elizabeth St                    ││
│  │ 2.6 km • 14 min                     ││
│  │ 🔵 60% painted    ⭐ 3.8 comfort    ││
│  └─────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

---

## 1.5 Infrastructure Rating Screen

```
┌─────────────────────────────────────────┐
│  ◀ Back       Rate This Lane            │
├─────────────────────────────────────────┤
│                                         │
│  🛤️ Oxford Street Cycleway              │
│                                         │
│  How would you rate this lane?          │
│                                         │
│        ★ ★ ★ ★ ☆                        │
│        Tap to rate                      │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Add tags that describe this lane:      │
│                                         │
│  [ ] 🌙 Good at night                   │
│  [✓] 👨‍👩‍👧 Good with kids                  │
│  [✓] 📦 Cargo / e-bike friendly         │
│  [ ] 😰 Too many close passes           │
│  [ ] 🚌 Watch for buses                 │
│  [ ] 🚶 Pedestrian conflicts            │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Any other thoughts? (optional)         │
│  ┌─────────────────────────────────────┐│
│  │ Wide lane, good surface. Gets a     ││
│  │ bit busy near Taylor Square.        ││
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│                                         │
│          [ Submit Rating ⭐ ]           │
│                                         │
└─────────────────────────────────────────┘
```

---

# 2. Example JSON Objects

## 2.1 Segment Objects

```json
[
  {
    "id": "seg_oxford_001",
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [151.2152, -33.8808],
        [151.2178, -33.8795],
        [151.2211, -33.8779]
      ]
    },
    "facility_type": "separated_cycleway",
    "road_name": "Oxford Street",
    "speed_env_kmh": 40,
    "is_pop_up_cycleway": true,
    "daily_bike_trips": 2400,
    "crash_risk_score": 0.18,
    "comfort_score": 0.82,
    "popularity_score": 0.76,
    "lighting_quality": "good",
    "gradient_class": "flat",
    "tags": ["school_zone"]
  },
  {
    "id": "seg_bourke_015",
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [151.2089, -33.8732],
        [151.2103, -33.8748],
        [151.2118, -33.8765],
        [151.2134, -33.8781]
      ]
    },
    "facility_type": "separated_cycleway",
    "road_name": "Bourke Street",
    "speed_env_kmh": 50,
    "is_pop_up_cycleway": false,
    "daily_bike_trips": 3100,
    "crash_risk_score": 0.12,
    "comfort_score": 0.91,
    "popularity_score": 0.88,
    "lighting_quality": "good",
    "gradient_class": "flat",
    "tags": []
  },
  {
    "id": "seg_crown_mixed_042",
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [151.2155, -33.8865],
        [151.2148, -33.8878],
        [151.2141, -33.8892]
      ]
    },
    "facility_type": "mixed_traffic",
    "road_name": "Crown Street",
    "speed_env_kmh": 50,
    "is_pop_up_cycleway": false,
    "daily_bike_trips": 420,
    "crash_risk_score": 0.54,
    "comfort_score": 0.38,
    "popularity_score": 0.31,
    "lighting_quality": "ok",
    "gradient_class": "rolling",
    "tags": ["heavy_loading_zone"]
  }
]
```

## 2.2 POI Objects

```json
[
  {
    "id": "poi_central_rack_01",
    "type": "bike_rack",
    "name": "Central Station - Eddy Ave Racks",
    "location": {
      "type": "Point",
      "coordinates": [151.2069, -33.8830]
    },
    "capacity": 24,
    "is_secure": false,
    "lighting_quality": "good",
    "notes": "Covered area near taxi rank. CCTV monitored."
  },
  {
    "id": "poi_central_shed_01",
    "type": "bike_shed",
    "name": "Central Station Secure Parking",
    "location": {
      "type": "Point",
      "coordinates": [151.2063, -33.8836]
    },
    "capacity": 80,
    "is_secure": true,
    "lighting_quality": "good",
    "notes": "Opal card access. Open 5am-1am. $2/day."
  },
  {
    "id": "poi_redfern_rack_01",
    "type": "bike_rack",
    "name": "Redfern Station - Lawson St",
    "location": {
      "type": "Point",
      "coordinates": [151.1983, -33.8912]
    },
    "capacity": 16,
    "is_secure": false,
    "lighting_quality": "ok",
    "notes": "Street-level racks. Can get crowded during peak."
  }
]
```

## 2.3 Event Objects

```json
[
  {
    "id": "evt_001_glass",
    "segment_id": "seg_oxford_001",
    "reporter_id": "usr_anon_8f3a",
    "event_type": "glass",
    "severity": "medium",
    "description": "Broken bottle glass scattered in bike lane near Taylor Square. Swept to the side but still present.",
    "created_at": "2025-01-29T07:45:00+11:00",
    "status": "open"
  },
  {
    "id": "evt_002_construction",
    "segment_id": "seg_bourke_015",
    "reporter_id": "usr_anon_2d91",
    "event_type": "construction",
    "severity": "high",
    "description": "Road works blocking bike lane between Devonshire and Campbell. Detour via footpath signed.",
    "created_at": "2025-01-28T14:20:00+11:00",
    "status": "verified"
  },
  {
    "id": "evt_003_pothole",
    "segment_id": "seg_crown_mixed_042",
    "reporter_id": "usr_anon_5c7e",
    "event_type": "pothole",
    "severity": "medium",
    "description": "Large pothole near drain grate, about 30cm wide. Easy to miss at night.",
    "created_at": "2025-01-27T18:10:00+11:00",
    "status": "open"
  },
  {
    "id": "evt_004_good_infra",
    "segment_id": "seg_bourke_015",
    "reporter_id": "usr_anon_9f12",
    "event_type": "good_infra",
    "severity": "low",
    "description": "New section near Foveaux St is brilliant - smooth surface, clear markings, well separated from traffic.",
    "created_at": "2025-01-26T09:30:00+11:00",
    "status": "verified"
  },
  {
    "id": "evt_005_door_zone",
    "segment_id": "seg_crown_mixed_042",
    "reporter_id": "usr_anon_3b4f",
    "event_type": "door_zone_risk",
    "severity": "high",
    "description": "Parked cars along entire block. Had a close call with a door opening. Stay alert.",
    "created_at": "2025-01-25T17:55:00+11:00",
    "status": "open"
  }
]
```

---

# 3. API Contracts

## 3.1 GET /segments

Retrieve segments within a bounding box.

### Request

```
GET /api/v1/segments?bbox={west},{south},{east},{north}&facility_type={type}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bbox` | string | Yes | Bounding box: `west,south,east,north` (WGS84) |
| `facility_type` | string | No | Filter by type: `separated_cycleway`, `painted_lane`, `shared_path`, `mixed_traffic` |
| `min_comfort` | float | No | Minimum comfort_score (0–1) |

### Example Request

```
GET /api/v1/segments?bbox=151.20,-33.89,151.22,-33.87&facility_type=separated_cycleway
```

### Response

```json
{
  "segments": [
    {
      "id": "seg_oxford_001",
      "geometry": {
        "type": "LineString",
        "coordinates": [[151.2152, -33.8808], [151.2178, -33.8795]]
      },
      "facility_type": "separated_cycleway",
      "road_name": "Oxford Street",
      "speed_env_kmh": 40,
      "is_pop_up_cycleway": true,
      "daily_bike_trips": 2400,
      "crash_risk_score": 0.18,
      "comfort_score": 0.82,
      "popularity_score": 0.76,
      "lighting_quality": "good",
      "gradient_class": "flat",
      "tags": ["school_zone"]
    }
  ],
  "meta": {
    "total": 1,
    "bbox": "151.20,-33.89,151.22,-33.87"
  }
}
```

---

## 3.2 GET /segments/{id}

Retrieve a single segment with full details and recent reports.

### Request

```
GET /api/v1/segments/{segment_id}?include_reports=true&include_ratings=true
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `segment_id` | string | Yes | Segment ID (path param) |
| `include_reports` | boolean | No | Include recent reports (default: true) |
| `include_ratings` | boolean | No | Include rating summary (default: true) |

### Response

```json
{
  "segment": {
    "id": "seg_oxford_001",
    "geometry": {
      "type": "LineString",
      "coordinates": [[151.2152, -33.8808], [151.2178, -33.8795], [151.2211, -33.8779]]
    },
    "facility_type": "separated_cycleway",
    "road_name": "Oxford Street",
    "speed_env_kmh": 40,
    "is_pop_up_cycleway": true,
    "daily_bike_trips": 2400,
    "crash_risk_score": 0.18,
    "comfort_score": 0.82,
    "popularity_score": 0.76,
    "lighting_quality": "good",
    "gradient_class": "flat",
    "tags": ["school_zone"]
  },
  "reports": [
    {
      "id": "evt_001_glass",
      "event_type": "glass",
      "severity": "medium",
      "description": "Broken bottle glass scattered in bike lane...",
      "created_at": "2025-01-29T07:45:00+11:00",
      "status": "open"
    }
  ],
  "ratings": {
    "average_score": 4.2,
    "total_ratings": 127,
    "tag_counts": {
      "good_at_night": 45,
      "good_with_kids": 38,
      "cargo_friendly": 52,
      "close_passes": 12
    }
  }
}
```

---

## 3.3 POST /reports

Submit a new hazard or infrastructure report.

### Request

```
POST /api/v1/reports
Content-Type: application/json
```

### Request Body

```json
{
  "segment_id": "seg_oxford_001",
  "event_type": "pothole",
  "severity": "medium",
  "description": "Large pothole in the bike lane, about 30cm wide near the bus stop.",
  "location": {
    "type": "Point",
    "coordinates": [151.2165, -33.8801]
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `segment_id` | string | Yes | ID of the segment |
| `event_type` | enum | Yes | One of: `glass`, `pothole`, `closed`, `construction`, `door_zone_risk`, `near_miss`, `good_infra`, `other` |
| `severity` | enum | Yes | One of: `low`, `medium`, `high` |
| `description` | string | No | Free-text description (max 500 chars) |
| `location` | GeoJSON Point | No | Precise location if available |

### Response

```json
{
  "report": {
    "id": "evt_006_pothole",
    "segment_id": "seg_oxford_001",
    "event_type": "pothole",
    "severity": "medium",
    "description": "Large pothole in the bike lane...",
    "created_at": "2025-01-31T10:30:00+11:00",
    "status": "open"
  },
  "message": "Thanks legend! Your report is now live."
}
```

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_SEGMENT` | Segment ID does not exist |
| 400 | `INVALID_EVENT_TYPE` | Event type not recognised |
| 429 | `RATE_LIMITED` | Too many reports submitted |

---

## 3.4 GET /routes

Calculate cycling routes between two points.

### Request

```
GET /api/v1/routes?from={lat},{lng}&to={lat},{lng}&mode={mode}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from` | string | Yes | Origin: `lat,lng` |
| `to` | string | Yes | Destination: `lat,lng` |
| `mode` | enum | No | Routing preference: `fastest`, `safest`, `comfortable` (default: `safest`) |
| `avoid_steep` | boolean | No | Avoid steep gradients (default: false) |
| `alternatives` | integer | No | Number of alternative routes (1–3, default: 3) |

### Example Request

```
GET /api/v1/routes?from=-33.8808,151.2152&to=-33.8830,151.2069&mode=safest&alternatives=3
```

### Response

```json
{
  "routes": [
    {
      "id": "route_001",
      "summary": "Via Bourke St Cycleway",
      "distance_m": 2400,
      "duration_s": 720,
      "comfort_score": 0.85,
      "separated_percentage": 85,
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [151.2152, -33.8808],
          [151.2134, -33.8781],
          [151.2089, -33.8732],
          [151.2069, -33.8830]
        ]
      },
      "segments": [
        {
          "segment_id": "seg_oxford_001",
          "distance_m": 400
        },
        {
          "segment_id": "seg_bourke_015",
          "distance_m": 1200
        }
      ],
      "warnings": [
        {
          "type": "construction",
          "segment_id": "seg_bourke_015",
          "message": "Road works on Bourke St – follow detour signs"
        }
      ],
      "is_recommended": true
    },
    {
      "id": "route_002",
      "summary": "Via Crown St",
      "distance_m": 2100,
      "duration_s": 600,
      "comfort_score": 0.42,
      "separated_percentage": 40,
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [151.2152, -33.8808],
          [151.2148, -33.8878],
          [151.2069, -33.8830]
        ]
      },
      "segments": [
        {
          "segment_id": "seg_crown_mixed_042",
          "distance_m": 800
        }
      ],
      "warnings": [
        {
          "type": "door_zone_risk",
          "segment_id": "seg_crown_mixed_042",
          "message": "Watch for car doors on Crown St"
        }
      ],
      "is_recommended": false
    }
  ],
  "meta": {
    "from": {
      "lat": -33.8808,
      "lng": 151.2152
    },
    "to": {
      "lat": -33.8830,
      "lng": 151.2069
    },
    "mode": "safest"
  }
}
```

---

## 3.5 POST /ratings

Submit a rating for a segment.

### Request

```
POST /api/v1/ratings
Content-Type: application/json
```

### Request Body

```json
{
  "segment_id": "seg_oxford_001",
  "score": 4,
  "tags": ["good_at_night", "cargo_friendly"],
  "comment": "Wide lane, good surface. Gets a bit busy near Taylor Square."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `segment_id` | string | Yes | ID of the segment |
| `score` | integer | Yes | Rating 1–5 stars |
| `tags` | array | No | Tags: `good_at_night`, `good_with_kids`, `cargo_friendly`, `close_passes`, `bus_conflicts`, `pedestrian_conflicts` |
| `comment` | string | No | Optional comment (max 280 chars) |

### Response

```json
{
  "rating": {
    "id": "rating_0451",
    "segment_id": "seg_oxford_001",
    "score": 4,
    "tags": ["good_at_night", "cargo_friendly"],
    "created_at": "2025-01-31T11:00:00+11:00"
  },
  "message": "Rating submitted! Cheers for the feedback."
}
```

---

## 3.6 GET /pois

Retrieve points of interest (bike parking, etc).

### Request

```
GET /api/v1/pois?bbox={west},{south},{east},{north}&type={type}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bbox` | string | Yes | Bounding box |
| `type` | string | No | Filter: `bike_rack`, `bike_shed`, `station_entrance`, `micromobility_hub` |
| `is_secure` | boolean | No | Filter for secure parking only |

### Response

```json
{
  "pois": [
    {
      "id": "poi_central_rack_01",
      "type": "bike_rack",
      "name": "Central Station - Eddy Ave Racks",
      "location": {
        "type": "Point",
        "coordinates": [151.2069, -33.8830]
      },
      "capacity": 24,
      "is_secure": false,
      "lighting_quality": "good",
      "notes": "Covered area near taxi rank. CCTV monitored."
    }
  ],
  "meta": {
    "total": 1
  }
}
```

---

# 4. Design Language

## 4.1 Voice & Tone

| Context | Tone | Example |
|---------|------|---------|
| **Success states** | Warm, casual, local | "Thanks, legend!" / "Cheers for the feedback." |
| **Warnings** | Clear, helpful, not alarming | "Heads up: road works ahead" |
| **Errors** | Apologetic, actionable | "Couldn't find that route. Try a different destination?" |
| **Empty states** | Encouraging | "No reports here yet – be the first!" |
| **Onboarding** | Welcoming, community-focused | "Join Sydney's cycling community" |

## 4.2 Copy Guidelines

### Do
- Use Australian English spelling (colour, metre, kerb)
- Be concise – mobile screens are small
- Use "you/your" to address the rider directly
- Reference local landmarks ("near Taylor Square", "towards Central")
- Use friendly slang sparingly ("legend", "cheers", "mate")

### Don't
- Use jargon or technical terms ("segment", "node", "polyline")
- Be preachy about safety – inform, don't lecture
- Use negative framing for low scores ("dangerous") – use neutral ("higher risk")

## 4.3 Label Conventions

### Scores

| Score | Label | Colour |
|-------|-------|--------|
| comfort_score 0.8–1.0 | "Very comfortable" | Green |
| comfort_score 0.6–0.8 | "Comfortable" | Light green |
| comfort_score 0.4–0.6 | "Okay" | Yellow |
| comfort_score 0.2–0.4 | "Less comfortable" | Orange |
| comfort_score 0–0.2 | "Take care" | Red |

| Score | Label | Colour |
|-------|-------|--------|
| crash_risk_score 0–0.3 | "Low risk" | Green |
| crash_risk_score 0.3–0.6 | "Moderate risk" | Yellow |
| crash_risk_score 0.6–1.0 | "Higher risk" | Red |

### Facility Types

| Type | User-facing label |
|------|-------------------|
| `separated_cycleway` | "Separated bike lane" |
| `painted_lane` | "Painted bike lane" |
| `shared_path` | "Shared path" |
| `mixed_traffic` | "Shared road" |

### Route Modes

| Mode | Label | Description |
|------|-------|-------------|
| `fastest` | "Fastest" | "Shortest time, may include busy roads" |
| `safest` | "Safest" | "Avoids crash hotspots, prefers separated lanes" |
| `comfortable` | "Most comfortable" | "Flat, well-lit paths with good surfaces" |

## 4.4 Iconography

| Concept | Icon | Usage |
|---------|------|-------|
| Separated cycleway | 🟢 or custom bike-in-lane icon | Map legend, chips |
| Painted lane | 🔵 | Map legend |
| Shared path | 🟣 | Map legend |
| Mixed traffic | 🟠 | Map legend |
| Hazard report | ⚠️ | Report buttons, markers |
| Good infrastructure | ✨ | Positive reports |
| Secure parking | 🔒 | POI markers |
| Current location | 📍 | Map, routing |

## 4.5 Colour Palette

| Name | Hex | Usage |
|------|-----|-------|
| Primary Green | `#22C55E` | Separated lanes, positive states |
| Primary Blue | `#3B82F6` | Painted lanes, links, interactive |
| Warning Amber | `#F59E0B` | Moderate warnings |
| Danger Red | `#EF4444` | High risk, urgent reports |
| Purple | `#A855F7` | Shared paths |
| Orange | `#F97316` | Mixed traffic |
| Neutral Grey | `#6B7280` | Secondary text, borders |
| Background | `#F9FAFB` | Screen backgrounds |
| Surface | `#FFFFFF` | Cards, sheets |

## 4.6 Typography

| Style | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| H1 | System | 24px | Bold | Screen titles |
| H2 | System | 18px | Semibold | Section headers |
| Body | System | 16px | Regular | Main content |
| Caption | System | 14px | Regular | Secondary info |
| Label | System | 12px | Medium | Chips, badges |

---

# 5. Component Specifications

## 5.1 Segment Card (Compact)

Used in route results and nearby segments list.

```
┌─────────────────────────────────────────┐
│ 🟢 Oxford Street                        │
│ Separated bike lane • 2.4 km            │
│ ⭐ 4.2  •  🛡️ Low risk  •  😌 Comfy     │
└─────────────────────────────────────────┘
```

## 5.2 Report Chip

```
┌──────────┐
│ 🔧       │
│ Pothole  │
│ 2d ago   │
└──────────┘
```

- Tappable
- Shows event_type icon and label
- Relative timestamp

## 5.3 Score Bar

```
COMFORT
████████░░  8.2/10
```

- Fill based on score
- Colour gradient from red (0) to green (10)
- Numeric label

## 5.4 Tag Chip (Selectable)

```
[ ] 🌙 Good at night     [✓] 📦 Cargo-friendly
```

- Checkbox + icon + label
- Selected state: filled background

---

# 6. Error States

## 6.1 No Internet

```
┌─────────────────────────────────────────┐
│                                         │
│            📡                           │
│                                         │
│      You're offline                     │
│                                         │
│   Connect to the internet to see        │
│   the latest lane info and reports.     │
│                                         │
│         [ Try again ]                   │
│                                         │
└─────────────────────────────────────────┘
```

## 6.2 No Routes Found

```
┌─────────────────────────────────────────┐
│                                         │
│            🗺️                           │
│                                         │
│      Couldn't find a route              │
│                                         │
│   The destination might be outside      │
│   the City of Sydney area.              │
│                                         │
│   [ Try different destination ]         │
│                                         │
└─────────────────────────────────────────┘
```

## 6.3 Location Permission Denied

```
┌─────────────────────────────────────────┐
│                                         │
│            📍                           │
│                                         │
│      Location access needed             │
│                                         │
│   Turn on location to see lanes         │
│   near you and get directions.          │
│                                         │
│   [ Open settings ]   [ Skip for now ]  │
│                                         │
└─────────────────────────────────────────┘
```

---

# 7. Accessibility

- All interactive elements must have minimum 44×44pt touch targets
- Colour is never the only indicator – use icons and labels alongside
- Score bars include numeric values for screen readers
- Map provides non-visual segment list alternative
- High contrast mode support for segment colours

---

*Document Version: 1.0*
*City of Sydney LGA Cycling Infrastructure App*
