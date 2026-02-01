/**
 * MICRO2MOVE SYDNEY - Data Fetching & Transformation Script
 *
 * This script fetches cycling data from open data sources and transforms
 * it into the app's data model format.
 *
 * Usage:
 *   node fetch-data.js
 *
 * Requirements:
 *   npm install node-fetch
 */

const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // City of Sydney Cycle Network - ArcGIS Feature Server
  CYCLE_NETWORK_URL: 'https://services1.arcgis.com/cNVyNtjGVZybOQWZ/ArcGIS/rest/services/Cycle_network/FeatureServer/0/query',

  // TfNSW Open Data - Pop-up Cycleways
  POPUP_CYCLEWAY_URL: 'https://opendata.transport.nsw.gov.au/dataset/sydney-region-pop-cycleway',

  // Output directory
  OUTPUT_DIR: path.join(__dirname, '..', 'data'),

  // City of Sydney LGA bounding box
  SYDNEY_LGA_BOUNDS: {
    xmin: 151.17,
    ymin: -33.92,
    xmax: 151.25,
    ymax: -33.84
  }
};

// ============================================
// FETCH CYCLE NETWORK DATA
// ============================================

async function fetchCycleNetwork() {
  console.log('📡 Fetching City of Sydney Cycle Network...');

  const params = new URLSearchParams({
    where: '1=1',
    outFields: '*',
    f: 'geojson',
    outSR: '4326', // WGS84
    // Bounding box for City of Sydney LGA
    geometry: JSON.stringify({
      xmin: CONFIG.SYDNEY_LGA_BOUNDS.xmin,
      ymin: CONFIG.SYDNEY_LGA_BOUNDS.ymin,
      xmax: CONFIG.SYDNEY_LGA_BOUNDS.xmax,
      ymax: CONFIG.SYDNEY_LGA_BOUNDS.ymax,
      spatialReference: { wkid: 4326 }
    }),
    geometryType: 'esriGeometryEnvelope',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects'
  });

  try {
    const response = await fetch(`${CONFIG.CYCLE_NETWORK_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.features?.length || 0} features`);
    return data;

  } catch (error) {
    console.error('❌ Failed to fetch cycle network:', error.message);
    console.log('💡 Try downloading manually from:');
    console.log('   https://data.cityofsydney.nsw.gov.au/datasets/cityofsydney::cycle-network-3');
    return null;
  }
}

// ============================================
// TRANSFORM TO APP FORMAT
// ============================================

function transformToSegments(geojsonData) {
  console.log('🔄 Transforming data to app format...');

  if (!geojsonData?.features) {
    console.error('❌ No features to transform');
    return [];
  }

  const segments = geojsonData.features.map((feature, index) => {
    const props = feature.properties || {};
    const coords = feature.geometry?.coordinates || [];

    // Map facility type from source data
    const facilityType = mapFacilityType(props);

    // Calculate scores based on facility type and other attributes
    const comfortScore = calculateComfortScore(facilityType, props);
    const riskScore = calculateRiskScore(facilityType, props);

    // Determine local area from coordinates
    const center = calculateCenter(coords);
    const localArea = determineLocalArea(center);

    return {
      id: `seg_${props.OBJECTID || props.FID || index}`,
      road_name: props.STREETNAME || props.STREET || props.NAME || 'Unknown',
      local_area: localArea,
      facility_type: facilityType,
      is_pop_up_cycleway: isPopUpCycleway(props),
      speed_env_kmh: estimateSpeedEnvironment(props),
      lane_width_m: parseLaneWidth(props),
      gradient_class: 'flat', // Would need elevation data
      lighting_quality: 'unknown', // Would need lighting data
      heavy_loading_zone: false, // Would need land use data
      has_bike_counts: false,
      daily_bike_trips: null,
      popularity_score: 0.5, // Default, would need count data
      crash_risk_score: riskScore,
      comfort_score: comfortScore,
      perceived_safety_score: comfortScore * 0.9,
      avg_user_rating: null,
      rating_count: 0,
      tags: generateTags(facilityType, props),
      // Geometry
      coordinates: formatCoordinates(coords),
      center: center,
      // Metadata
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Original properties for reference
      _source: props
    };
  });

  console.log(`✅ Transformed ${segments.length} segments`);
  return segments;
}

// ============================================
// MAPPING FUNCTIONS
// ============================================

function mapFacilityType(props) {
  // Common field names from City of Sydney data
  const typeField = props.FACILITY_TYPE || props.FACILITYTYPE ||
                    props.TYPE || props.CYCLEWAY_TYPE ||
                    props.BIKE_FACILITY || '';

  const typeStr = typeField.toLowerCase();

  // Map to our facility types
  if (typeStr.includes('separated') || typeStr.includes('protected') ||
      typeStr.includes('cycl') && typeStr.includes('path')) {
    return 'separated_cycleway';
  }
  if (typeStr.includes('painted') || typeStr.includes('on-road') ||
      typeStr.includes('lane') && !typeStr.includes('sep')) {
    return 'painted_lane';
  }
  if (typeStr.includes('shared') || typeStr.includes('path') ||
      typeStr.includes('off-road')) {
    return 'shared_path';
  }

  // Default to mixed traffic if unknown
  return 'mixed_traffic';
}

function isPopUpCycleway(props) {
  const allProps = JSON.stringify(props).toLowerCase();
  return allProps.includes('pop-up') || allProps.includes('popup') ||
         allProps.includes('temporary');
}

function calculateComfortScore(facilityType, props) {
  const baseScores = {
    'separated_cycleway': 0.85,
    'shared_path': 0.75,
    'painted_lane': 0.55,
    'mixed_traffic': 0.30
  };

  let score = baseScores[facilityType] || 0.5;

  // Adjust based on other factors if available
  const width = parseLaneWidth(props);
  if (width >= 3) score += 0.05;
  if (width >= 2 && width < 3) score += 0.02;
  if (width > 0 && width < 1.5) score -= 0.1;

  return Math.min(1, Math.max(0, score));
}

function calculateRiskScore(facilityType, props) {
  const baseRisk = {
    'separated_cycleway': 0.15,
    'shared_path': 0.20,
    'painted_lane': 0.45,
    'mixed_traffic': 0.65
  };

  let risk = baseRisk[facilityType] || 0.5;

  // Would adjust based on crash data if available
  return Math.min(1, Math.max(0, risk));
}

function estimateSpeedEnvironment(props) {
  const roadType = (props.ROAD_TYPE || props.ROADTYPE || '').toLowerCase();

  if (roadType.includes('local') || roadType.includes('residential')) return 40;
  if (roadType.includes('collector')) return 50;
  if (roadType.includes('arterial') || roadType.includes('main')) return 60;

  return 50; // Default
}

function parseLaneWidth(props) {
  const widthField = props.WIDTH || props.LANE_WIDTH || props.CYCLEWAY_WIDTH;
  if (widthField) {
    const parsed = parseFloat(widthField);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

function generateTags(facilityType, props) {
  const tags = [];

  if (facilityType === 'separated_cycleway') {
    tags.push('family_friendly');
  }

  if (isPopUpCycleway(props)) {
    tags.push('pop_up_lane');
  }

  const allProps = JSON.stringify(props).toLowerCase();
  if (allProps.includes('school')) tags.push('school_zone');
  if (allProps.includes('station') || allProps.includes('train')) tags.push('near_station');

  return tags;
}

function formatCoordinates(coords) {
  // Handle both LineString and MultiLineString
  if (!coords || coords.length === 0) return [];

  // Check if it's a simple LineString or MultiLineString
  if (typeof coords[0][0] === 'number') {
    // Simple LineString: [[lng, lat], [lng, lat], ...]
    return coords.map(coord => ({
      lat: coord[1],
      lng: coord[0]
    }));
  } else {
    // MultiLineString: [[[lng, lat], ...], [[lng, lat], ...]]
    // Flatten to single LineString (first segment)
    return coords[0].map(coord => ({
      lat: coord[1],
      lng: coord[0]
    }));
  }
}

function calculateCenter(coords) {
  const formatted = formatCoordinates(coords);
  if (formatted.length === 0) return { lat: -33.8688, lng: 151.2093 };

  const midIndex = Math.floor(formatted.length / 2);
  return formatted[midIndex] || formatted[0];
}

function determineLocalArea(center) {
  // Approximate local area boundaries
  const areas = [
    { name: 'Sydney CBD', bounds: { minLat: -33.875, maxLat: -33.860, minLng: 151.200, maxLng: 151.215 } },
    { name: 'Surry Hills', bounds: { minLat: -33.895, maxLat: -33.875, minLng: 151.205, maxLng: 151.220 } },
    { name: 'Darlinghurst', bounds: { minLat: -33.885, maxLat: -33.870, minLng: 151.215, maxLng: 151.230 } },
    { name: 'Redfern', bounds: { minLat: -33.900, maxLat: -33.885, minLng: 151.195, maxLng: 151.210 } },
    { name: 'Pyrmont', bounds: { minLat: -33.875, maxLat: -33.860, minLng: 151.185, maxLng: 151.200 } },
    { name: 'Ultimo', bounds: { minLat: -33.885, maxLat: -33.875, minLng: 151.190, maxLng: 151.205 } },
    { name: 'Glebe', bounds: { minLat: -33.885, maxLat: -33.870, minLng: 151.175, maxLng: 151.190 } },
    { name: 'Newtown', bounds: { minLat: -33.905, maxLat: -33.890, minLng: 151.175, maxLng: 151.185 } },
    { name: 'Chippendale', bounds: { minLat: -33.890, maxLat: -33.880, minLng: 151.195, maxLng: 151.205 } },
    { name: 'Waterloo', bounds: { minLat: -33.910, maxLat: -33.895, minLng: 151.200, maxLng: 151.215 } },
    { name: 'Alexandria', bounds: { minLat: -33.915, maxLat: -33.900, minLng: 151.185, maxLng: 151.200 } },
    { name: 'Haymarket', bounds: { minLat: -33.885, maxLat: -33.875, minLng: 151.200, maxLng: 151.210 } }
  ];

  for (const area of areas) {
    if (center.lat >= area.bounds.minLat && center.lat <= area.bounds.maxLat &&
        center.lng >= area.bounds.minLng && center.lng <= area.bounds.maxLng) {
      return area.name;
    }
  }

  return 'City of Sydney';
}

// ============================================
// FILE OPERATIONS
// ============================================

function ensureOutputDir() {
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${CONFIG.OUTPUT_DIR}`);
  }
}

function saveToFile(filename, data) {
  const filepath = path.join(CONFIG.OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`💾 Saved: ${filepath}`);
}

function loadLocalGeoJSON(filename) {
  const filepath = path.join(CONFIG.OUTPUT_DIR, filename);
  if (fs.existsSync(filepath)) {
    console.log(`📂 Loading local file: ${filepath}`);
    const content = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(content);
  }
  return null;
}

// ============================================
// GENERATE APP DATA FILE
// ============================================

function generateAppDataFile(segments) {
  const appData = `/**
 * MICRO2MOVE SYDNEY - Generated Data
 *
 * Auto-generated from City of Sydney Open Data
 * Generated: ${new Date().toISOString()}
 * Segments: ${segments.length}
 */

const SEGMENTS = ${JSON.stringify(segments, null, 2)};

// Export for use in app
if (typeof module !== 'undefined') {
  module.exports = { SEGMENTS };
}
`;

  const filepath = path.join(__dirname, '..', 'js', 'data-generated.js');
  fs.writeFileSync(filepath, appData);
  console.log(`💾 Generated app data file: ${filepath}`);
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('');
  console.log('🚴 MICRO2MOVE SYDNEY - Data Fetcher');
  console.log('====================================');
  console.log('');

  ensureOutputDir();

  // Try to fetch from API
  let geojsonData = await fetchCycleNetwork();

  // If API fails, try loading local file
  if (!geojsonData) {
    console.log('');
    console.log('📂 Attempting to load from local file...');
    geojsonData = loadLocalGeoJSON('cycle-network-raw.geojson');
  }

  if (!geojsonData) {
    console.log('');
    console.log('❌ No data available. Please:');
    console.log('   1. Download the GeoJSON from City of Sydney Data Hub');
    console.log('   2. Save it as: app/data/cycle-network-raw.geojson');
    console.log('   3. Run this script again');
    console.log('');
    console.log('   Download URL:');
    console.log('   https://data.cityofsydney.nsw.gov.au/datasets/cityofsydney::cycle-network-3');
    console.log('');
    process.exit(1);
  }

  // Save raw data
  saveToFile('cycle-network-raw.geojson', geojsonData);

  // Transform to app format
  const segments = transformToSegments(geojsonData);

  // Save transformed data
  saveToFile('segments.json', segments);

  // Generate app data file
  generateAppDataFile(segments);

  console.log('');
  console.log('✅ Data processing complete!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   Total segments: ${segments.length}`);

  // Count by facility type
  const typeCounts = segments.reduce((acc, seg) => {
    acc[seg.facility_type] = (acc[seg.facility_type] || 0) + 1;
    return acc;
  }, {});

  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`   - ${type}: ${count}`);
  });

  console.log('');
  console.log('📁 Output files:');
  console.log(`   - ${path.join(CONFIG.OUTPUT_DIR, 'segments.json')}`);
  console.log(`   - ${path.join(__dirname, '..', 'js', 'data-generated.js')}`);
  console.log('');
}

// Run if called directly
main().catch(console.error);
