# Micro2Move Sydney - Mock App Interface

A functional prototype for the Sydney Bike Waze app, built for **City of Sydney LGA**.

## Quick Start

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Directions API** (for routing)
   - **Geocoding API**
4. Create credentials → API Key
5. (Recommended) Restrict the key to your domain

### 2. Add Your API Key

Open `index.html` and replace `YOUR_API_KEY`:

```html
<!-- Line ~15 -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places,geometry&callback=initMap" async defer></script>
```

### 3. Run the App

**Option A: Local file**
- Simply open `index.html` in Chrome/Firefox

**Option B: Local server (recommended)**
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# Then open http://localhost:8000
```

---

## Project Structure

```
app/
├── index.html              # Main HTML with all screens
├── css/
│   └── styles.css          # All styles (CSS custom properties)
├── js/
│   ├── data.js             # Sample data (segments, POIs, events)
│   ├── data-generated.js   # Real data (after running scripts)
│   ├── map.js              # Google Maps integration
│   └── app.js              # UI interactions and app logic
├── data/                   # Downloaded/generated data files
├── scripts/
│   ├── fetch_data.py       # Python data fetcher
│   ├── fetch-data.js       # Node.js data fetcher
│   └── README.md           # Script documentation
├── assets/                 # (empty) For images/icons
└── README.md               # This file
```

---

## Fetch Real Data

### Option 1: Python (Recommended)

```bash
cd app/scripts
pip install requests pandas
python fetch_data.py
```

### Option 2: Node.js

```bash
cd app/scripts
npm install node-fetch
node fetch-data.js
```

### What It Does

1. Fetches cycle network from **City of Sydney Open Data**
2. Transforms to app's segment format
3. Generates `js/data-generated.js`

### Data Sources

| Source | Data |
|--------|------|
| [City of Sydney Cycle Network](https://data.cityofsydney.nsw.gov.au/datasets/cityofsydney::cycle-network-3) | Segment geometries, facility types |
| [TfNSW Cycling Counts](https://opendata.transport.nsw.gov.au/dataset/cycling-count) | Daily bike trips |
| [Pop-up Cycleways](https://opendata.transport.nsw.gov.au/dataset/sydney-region-pop-cycleway) | Pop-up lane flags |

See `scripts/README.md` for manual download instructions if APIs are unavailable.

---

## Screens Included

| Screen | Description | Entry Point |
|--------|-------------|-------------|
| **Map Browse** | Main map with segment overlays | Default view |
| **Segment Detail** | Bottom sheet with full segment info | Tap segment → "View details" |
| **Route Planning** | Route search with 3 preference modes | Nav: Route tab |
| **Community Feed** | Recent events grouped by time | Nav: Feed tab |
| **Profile** | User stats and settings | Nav: Profile tab |
| **Report Modal** | Submit hazard/infra reports | FAB or "Report" button |
| **Rating Modal** | Rate segments with stars + tags | "Rate This Segment" button |

---

## Key Features to Implement

### Currently Mocked (Frontend Only)

| Feature | Status | Notes |
|---------|--------|-------|
| Map segment display | ✅ Working | Uses sample polylines |
| Segment card popup | ✅ Working | Shows on segment tap |
| Bottom sheet | ✅ Working | Full segment details |
| Report modal | ✅ Working | Form UI only |
| Rating modal | ✅ Working | Form UI only |
| Community feed | ✅ Working | Uses sample events |
| Navigation | ✅ Working | Tab switching |
| Toast notifications | ✅ Working | Success messages |

### Needs Backend Integration

| Feature | API Endpoint | Priority |
|---------|--------------|----------|
| Fetch segments | `GET /segments?bbox=...` | High |
| Fetch segment detail | `GET /segments/{id}` | High |
| Submit report | `POST /events` | High |
| Submit rating | `POST /ratings` | High |
| Fetch events feed | `GET /events` | High |
| Vote on event | `POST /events/{id}/vote` | Medium |
| Calculate routes | `GET /routes` | Medium |
| Fetch POIs | `GET /pois` | Medium |
| User authentication | - | Low |

---

## API Integration Guide

### Replace Sample Data with API Calls

**Example: Fetching Segments**

```javascript
// In map.js, replace addSegmentsToMap():

async function fetchSegments(bounds) {
  const bbox = `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;

  const response = await fetch(`/api/v1/segments?bbox=${bbox}`);
  const data = await response.json();

  return data.segments;
}

async function addSegmentsToMap(map) {
  const bounds = map.getBounds().toJSON();
  const segments = await fetchSegments(bounds);

  segments.forEach(segment => {
    // ... create polylines
  });
}
```

**Example: Submitting a Report**

```javascript
// In app.js, replace submitReport():

async function submitReport() {
  const payload = {
    segment_id: AppState.selectedSegment?.id,
    event_type: AppState.selectedReportType,
    severity: document.querySelector('input[name="severity"]:checked')?.value,
    description: document.querySelector('.report-textarea')?.value,
    location: {
      lat: AppState.selectedSegment?.center?.lat,
      lng: AppState.selectedSegment?.center?.lng
    }
  };

  const response = await fetch('/api/v1/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    closeModal('reportModal');
    showToast('Thanks, legend! Your report is now live.');
  }
}
```

---

## Customization

### Colors (CSS Variables)

Edit `css/styles.css` at the top:

```css
:root {
  --brand-green: #22C55E;      /* Primary actions */
  --brand-blue: #3B82F6;       /* Painted lanes */
  --brand-purple: #A855F7;     /* Shared paths */
  --brand-orange: #F97316;     /* Mixed traffic */
  --danger: #EF4444;           /* High risk */
  --warning: #F59E0B;          /* Warnings */
}
```

### Map Styles

Edit `js/map.js` - `LIGHT_MAP_STYLES` array for custom Google Maps styling.

### Sample Data

Edit `js/data.js` to add/modify:
- `SEGMENTS` - Bike lane segments
- `POIS` - Points of interest
- `EVENTS` - Community reports

---

## Google Maps API Quotas

| API | Free Tier | Cost After |
|-----|-----------|------------|
| Maps JavaScript | $200/month credit | $7 per 1000 loads |
| Directions | 40,000 requests/month | $5 per 1000 |
| Places | 100,000 requests/month | $17 per 1000 |

For development, the free tier is usually sufficient.

---

## Browser Support

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- Mobile Safari (iOS 14+) ✅
- Chrome Mobile (Android) ✅

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 |
| Styling | CSS3 (Custom Properties, Flexbox, Grid) |
| Scripting | Vanilla JavaScript (ES6+) |
| Maps | Google Maps JavaScript API |
| Fonts | Inter (Google Fonts) |

No build tools required - pure HTML/CSS/JS for easy handoff.

---

## Files for Backend Developer

Refer to these specification files in the parent directory:

| File | Contents |
|------|----------|
| `api-spec.yaml` | OpenAPI 3.0 specification |
| `example-data.json` | Sample JSON payloads |
| `sydney-bike-waze-design-spec.md` | Full design documentation |
| `ui-components-spec.md` | Component specifications |
| `visual-design-spec.md` | Visual design system |

---

## Support

For questions about this prototype, refer to the design spec documents.

---

*Micro2Move Sydney - City of Sydney LGA Cycling App*
