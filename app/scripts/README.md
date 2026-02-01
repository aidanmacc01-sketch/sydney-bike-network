# Data Scripts

Scripts for fetching and transforming Sydney cycling data from open data sources.

## Quick Start

### Option 1: Python (Recommended)

```bash
cd app/scripts

# Install dependencies
pip install requests pandas

# Run the script
python fetch_data.py
```

### Option 2: Node.js

```bash
cd app/scripts

# Install dependencies
npm install node-fetch

# Run the script
node fetch-data.js
```

## What the Scripts Do

1. **Fetch** cycle network data from City of Sydney Open Data
2. **Transform** to the app's segment format
3. **Generate** `data-generated.js` for use in the app

## Output Files

| File | Description |
|------|-------------|
| `../data/cycle-network-raw.geojson` | Raw data from source |
| `../data/segments.json` | Transformed segment data |
| `../js/data-generated.js` | Ready-to-use JavaScript file |

## Manual Data Download

If the API isn't working, download manually:

### 1. City of Sydney Cycle Network

1. Go to: https://data.cityofsydney.nsw.gov.au/datasets/cityofsydney::cycle-network-3
2. Click **Download** → **GeoJSON**
3. Save as: `app/data/cycle-network-raw.geojson`
4. Run the script again

### 2. TfNSW Cycling Count Data

1. Go to: https://opendata.transport.nsw.gov.au/dataset/cycling-count
2. Download CSV files for City of Sydney
3. Use to populate `daily_bike_trips` field

## Data Sources

| Source | URL | Fields |
|--------|-----|--------|
| Cycle Network | [City of Sydney Data Hub](https://data.cityofsydney.nsw.gov.au/datasets/cityofsydney::cycle-network-3) | geometry, facility_type, road_name |
| Cycling Counts | [TfNSW Open Data](https://opendata.transport.nsw.gov.au/dataset/cycling-count) | daily_bike_trips |
| Pop-up Cycleways | [TfNSW Open Data](https://opendata.transport.nsw.gov.au/dataset/sydney-region-pop-cycleway) | is_pop_up_cycleway |
| Cycling Propensity | [TfNSW Open Data](https://opendata.transport.nsw.gov.au/dataset/cycling-propensity) | popularity_score |

## Extending the Scripts

### Adding Crash Data

For `crash_risk_score`, you can integrate NSW crash data:

```python
# Add to fetch_data.py
CRASH_DATA_URL = "https://data.nsw.gov.au/data/dataset/nsw-road-crash-data"

def fetch_crash_data():
    # Fetch and filter for cycling crashes in City of Sydney
    pass

def calculate_risk_from_crashes(segment, crashes):
    # Calculate risk based on nearby crashes
    pass
```

### Adding Cycling Counts

```python
def integrate_cycling_counts(segments, count_data):
    """Match counting stations to segments."""
    for segment in segments:
        # Find nearest counting station
        nearest = find_nearest_station(segment["center"], count_data)
        if nearest:
            segment["daily_bike_trips"] = nearest["count"]
            segment["has_bike_counts"] = True
    return segments
```

## Troubleshooting

### "No data available" error

The City of Sydney API may be temporarily unavailable. Try:
1. Wait a few minutes and retry
2. Download manually (see above)
3. Check if the URL has changed at data.cityofsydney.nsw.gov.au

### Missing fields

Some fields require additional data sources:
- `lighting_quality` - Would need street lighting data
- `gradient_class` - Would need elevation/DEM data
- `crash_risk_score` - Would need NSW crash data
- `daily_bike_trips` - Needs cycling count data

## Data Quality Notes

- **Geometry accuracy**: Data is authoritative from City of Sydney
- **Facility types**: Mapped from source classification, may need review
- **Comfort scores**: Calculated based on facility type, adjust weights as needed
- **Local areas**: Determined by coordinate bounds, approximate only
