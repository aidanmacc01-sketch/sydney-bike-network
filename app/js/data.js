/**
 * MICRO2MOVE SYDNEY - Sample Data
 * City of Sydney Bike Waze App
 *
 * This file contains all sample data for the mock app.
 * Replace with API calls in production.
 */

// ============================================
// SEGMENTS DATA
// ============================================
const SEGMENTS = [
  {
    id: "seg_bourke_north_01",
    road_name: "Bourke St",
    local_area: "Surry Hills",
    facility_type: "separated_cycleway",
    is_pop_up_cycleway: false,
    speed_env_kmh: 40,
    lane_width_m: 3.0,
    gradient_class: "flat",
    lighting_quality: "good",
    heavy_loading_zone: false,
    has_bike_counts: true,
    daily_bike_trips: 1800,
    popularity_score: 0.9,
    crash_risk_score: 0.2,
    comfort_score: 0.92,
    perceived_safety_score: 0.9,
    avg_user_rating: 4.8,
    rating_count: 126,
    tags: ["good_at_night", "family_friendly"],
    // Polyline coordinates (simplified for demo)
    coordinates: [
      { lat: -33.8820, lng: 151.2100 },
      { lat: -33.8850, lng: 151.2120 },
      { lat: -33.8880, lng: 151.2140 },
      { lat: -33.8910, lng: 151.2160 }
    ],
    // Center point for marker
    center: { lat: -33.8865, lng: 151.2130 }
  },
  {
    id: "seg_oxford_west_01",
    road_name: "Oxford St",
    local_area: "Darlinghurst",
    facility_type: "separated_cycleway",
    is_pop_up_cycleway: true,
    speed_env_kmh: 40,
    lane_width_m: 2.5,
    gradient_class: "rolling",
    lighting_quality: "good",
    heavy_loading_zone: true,
    has_bike_counts: true,
    daily_bike_trips: 2600,
    popularity_score: 0.95,
    crash_risk_score: 0.45,
    comfort_score: 0.7,
    perceived_safety_score: 0.65,
    avg_user_rating: 4.1,
    rating_count: 203,
    tags: ["door_zone_risk", "nightlife_area"],
    coordinates: [
      { lat: -33.8780, lng: 151.2130 },
      { lat: -33.8775, lng: 151.2170 },
      { lat: -33.8770, lng: 151.2210 },
      { lat: -33.8765, lng: 151.2250 }
    ],
    center: { lat: -33.8773, lng: 151.2190 }
  },
  {
    id: "seg_cleveland_mixed_01",
    road_name: "Cleveland St",
    local_area: "Redfern",
    facility_type: "mixed_traffic",
    is_pop_up_cycleway: false,
    speed_env_kmh: 50,
    lane_width_m: 0.0,
    gradient_class: "rolling",
    lighting_quality: "ok",
    heavy_loading_zone: true,
    has_bike_counts: false,
    daily_bike_trips: null,
    popularity_score: 0.35,
    crash_risk_score: 0.7,
    comfort_score: 0.3,
    perceived_safety_score: 0.28,
    avg_user_rating: 2.3,
    rating_count: 89,
    tags: ["high_traffic", "avoid_in_peak"],
    coordinates: [
      { lat: -33.8930, lng: 151.1980 },
      { lat: -33.8925, lng: 151.2020 },
      { lat: -33.8920, lng: 151.2060 },
      { lat: -33.8915, lng: 151.2100 }
    ],
    center: { lat: -33.8923, lng: 151.2040 }
  },
  {
    id: "seg_george_painted_01",
    road_name: "George St",
    local_area: "Sydney CBD",
    facility_type: "painted_lane",
    is_pop_up_cycleway: false,
    speed_env_kmh: 40,
    lane_width_m: 1.5,
    gradient_class: "flat",
    lighting_quality: "good",
    heavy_loading_zone: true,
    has_bike_counts: true,
    daily_bike_trips: 1200,
    popularity_score: 0.65,
    crash_risk_score: 0.5,
    comfort_score: 0.55,
    perceived_safety_score: 0.5,
    avg_user_rating: 3.4,
    rating_count: 156,
    tags: ["near_station", "high_traffic"],
    coordinates: [
      { lat: -33.8700, lng: 151.2070 },
      { lat: -33.8730, lng: 151.2070 },
      { lat: -33.8760, lng: 151.2068 },
      { lat: -33.8790, lng: 151.2065 }
    ],
    center: { lat: -33.8745, lng: 151.2068 }
  },
  {
    id: "seg_pyrmont_shared_01",
    road_name: "Pyrmont Bridge",
    local_area: "Pyrmont",
    facility_type: "shared_path",
    is_pop_up_cycleway: false,
    speed_env_kmh: 20,
    lane_width_m: 4.0,
    gradient_class: "flat",
    lighting_quality: "good",
    heavy_loading_zone: false,
    has_bike_counts: true,
    daily_bike_trips: 3200,
    popularity_score: 0.98,
    crash_risk_score: 0.15,
    comfort_score: 0.85,
    perceived_safety_score: 0.88,
    avg_user_rating: 4.5,
    rating_count: 312,
    tags: ["family_friendly", "good_at_night"],
    coordinates: [
      { lat: -33.8715, lng: 151.1985 },
      { lat: -33.8700, lng: 151.2000 },
      { lat: -33.8690, lng: 151.2020 }
    ],
    center: { lat: -33.8702, lng: 151.2002 }
  }
];

// ============================================
// POIs DATA
// ============================================
const POIS = [
  {
    id: "poi_townhall_racks_01",
    type: "bike_rack",
    name: "Town Hall Station Bike Racks",
    description: "On-street hoops near station entrance, close to light rail.",
    address: "George St, Sydney NSW",
    local_area: "Sydney CBD",
    location: { lat: -33.8731, lng: 151.2070 },
    capacity: 18,
    is_secure: false,
    is_covered: false,
    lighting_quality: "good",
    utilisation_level: "high",
    avg_user_rating: 3.9,
    rating_count: 57,
    tags: ["near_station", "quick_errands"]
  },
  {
    id: "poi_central_shed_01",
    type: "bike_shed",
    name: "Central Station Bike Shed",
    description: "Secure access-controlled shed suitable for all-day parking.",
    address: "Eddy Ave, Haymarket NSW",
    local_area: "Haymarket",
    location: { lat: -33.8833, lng: 151.2063 },
    capacity: 80,
    is_secure: true,
    is_covered: true,
    lighting_quality: "good",
    utilisation_level: "medium",
    avg_user_rating: 4.6,
    rating_count: 92,
    tags: ["commuter_friendly", "good_for_ebikes"]
  },
  {
    id: "poi_prince_alfred_park_01",
    type: "major_destination",
    name: "Prince Alfred Park",
    description: "Popular inner-city park with leisure and commuting routes.",
    address: "Chalmers St, Surry Hills NSW",
    local_area: "Surry Hills",
    location: { lat: -33.8870, lng: 151.2030 },
    capacity: null,
    is_secure: false,
    is_covered: false,
    lighting_quality: "ok",
    utilisation_level: "medium",
    avg_user_rating: 4.4,
    rating_count: 31,
    tags: ["family_rides", "green_space"]
  },
  {
    id: "poi_redfern_racks_01",
    type: "bike_rack",
    name: "Redfern Station Racks",
    description: "Street-level racks near station entrance.",
    address: "Lawson St, Redfern NSW",
    local_area: "Redfern",
    location: { lat: -33.8912, lng: 151.1983 },
    capacity: 16,
    is_secure: false,
    is_covered: false,
    lighting_quality: "ok",
    utilisation_level: "high",
    avg_user_rating: 3.2,
    rating_count: 43,
    tags: ["near_station"]
  }
];

// ============================================
// EVENTS DATA
// ============================================
const EVENTS = [
  {
    id: "evt_000001",
    reporter_id: "user_abc",
    segment_id: "seg_oxford_west_01",
    poi_id: null,
    location: { lat: -33.878, lng: 151.216 },
    event_type: "near_miss",
    severity: "high",
    description: "Close pass by a car near the intersection, felt unsafe.",
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    status: "open",
    upvotes: 14,
    downvotes: 1,
    source: "user",
    road_name: "Oxford St",
    local_area: "Darlinghurst"
  },
  {
    id: "evt_000002",
    reporter_id: "user_def",
    segment_id: "seg_bourke_north_01",
    poi_id: null,
    location: { lat: -33.887, lng: 151.215 },
    event_type: "good_infra",
    severity: "low",
    description: "Smooth surface and clear separation from traffic.",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: "verified",
    upvotes: 22,
    downvotes: 0,
    source: "user",
    road_name: "Bourke St",
    local_area: "Surry Hills"
  },
  {
    id: "evt_000003",
    reporter_id: "user_ghi",
    segment_id: "seg_cleveland_mixed_01",
    poi_id: null,
    location: { lat: -33.893, lng: 151.204 },
    event_type: "glass",
    severity: "medium",
    description: "Broken glass covering the shoulder for about 20m.",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: "open",
    upvotes: 9,
    downvotes: 0,
    source: "user",
    road_name: "Cleveland St",
    local_area: "Redfern"
  },
  {
    id: "evt_000004",
    reporter_id: "user_jkl",
    segment_id: null,
    poi_id: "poi_townhall_racks_01",
    location: { lat: -33.873, lng: 151.207 },
    event_type: "rack_full",
    severity: "medium",
    description: "All hoops full most evenings after 5pm.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: "verified",
    upvotes: 18,
    downvotes: 2,
    source: "user",
    poi_name: "Town Hall Station Bike Racks",
    local_area: "Sydney CBD"
  },
  {
    id: "evt_000005",
    reporter_id: "user_mno",
    segment_id: "seg_george_painted_01",
    poi_id: null,
    location: { lat: -33.874, lng: 151.207 },
    event_type: "construction",
    severity: "medium",
    description: "Roadworks blocking bike lane near Town Hall. Detour via footpath.",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: "verified",
    upvotes: 31,
    downvotes: 1,
    source: "user",
    road_name: "George St",
    local_area: "Sydney CBD"
  }
];

// ============================================
// ROUTES DATA (Sample)
// ============================================
const SAMPLE_ROUTES = [
  {
    id: "route_001",
    summary: "Via Bourke St Cycleway",
    distance_m: 2400,
    duration_s: 720,
    comfort_score: 0.85,
    separated_percentage: 85,
    is_recommended: true,
    warnings: [
      { type: "construction", message: "Construction on Devonshire St" }
    ]
  },
  {
    id: "route_002",
    summary: "Via Crown St",
    distance_m: 2100,
    duration_s: 600,
    comfort_score: 0.42,
    separated_percentage: 40,
    is_recommended: false,
    warnings: []
  },
  {
    id: "route_003",
    summary: "Via Elizabeth St",
    distance_m: 2600,
    duration_s: 840,
    comfort_score: 0.60,
    separated_percentage: 60,
    is_recommended: false,
    warnings: []
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get facility type color
 */
function getFacilityColor(facilityType) {
  const colors = {
    separated_cycleway: '#22C55E',
    painted_lane: '#3B82F6',
    shared_path: '#A855F7',
    mixed_traffic: '#F97316'
  };
  return colors[facilityType] || '#6B7280';
}

/**
 * Get facility type icon
 */
function getFacilityIcon(facilityType) {
  const icons = {
    separated_cycleway: '🟢',
    painted_lane: '🔵',
    shared_path: '🟣',
    mixed_traffic: '🟠'
  };
  return icons[facilityType] || '⚪';
}

/**
 * Get event type icon
 */
function getEventIcon(eventType) {
  const icons = {
    glass: '🔶',
    pothole: '🕳️',
    closed: '🚫',
    construction: '🚧',
    door_zone_risk: '🚗',
    near_miss: '⚠️',
    good_infra: '✨',
    rack_full: '🅿️',
    other: '📝'
  };
  return icons[eventType] || '📝';
}

/**
 * Get event title
 */
function getEventTitle(event) {
  const titles = {
    glass: `Glass on ${event.road_name || event.poi_name}`,
    pothole: `Pothole on ${event.road_name || event.poi_name}`,
    closed: `${event.road_name || event.poi_name} closed`,
    construction: `Roadworks on ${event.road_name || event.poi_name}`,
    door_zone_risk: `Door zone on ${event.road_name || event.poi_name}`,
    near_miss: `Near miss on ${event.road_name || event.poi_name}`,
    good_infra: `Good infra on ${event.road_name || event.poi_name}`,
    rack_full: `Rack full at ${event.poi_name || event.road_name}`,
    other: `Report on ${event.road_name || event.poi_name}`
  };
  return titles[event.event_type] || 'Report';
}

/**
 * Get risk level label
 */
function getRiskLabel(score) {
  if (score <= 0.3) return 'Low';
  if (score <= 0.6) return 'Moderate';
  return 'High';
}

/**
 * Get comfort label
 */
function getComfortLabel(score) {
  if (score >= 0.85) return 'Very comfy';
  if (score >= 0.65) return 'Comfy';
  if (score >= 0.45) return 'Okay';
  if (score >= 0.25) return 'A bit rough';
  return 'Take care';
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Format number (e.g., 1800 -> 1.8k)
 */
function formatNumber(num) {
  if (num === null || num === undefined) return '-';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

/**
 * Get tag display
 */
function getTagDisplay(tag) {
  const tags = {
    good_at_night: '🌙 Good at night',
    family_friendly: '👨‍👩‍👧 Family friendly',
    door_zone_risk: '⚠️ Door zone risk',
    nightlife_area: '🎉 Nightlife area',
    high_traffic: '🚗 High traffic',
    avoid_in_peak: '🕐 Avoid in peak',
    near_station: '🚉 Near station',
    quick_errands: '⚡ Quick errands',
    commuter_friendly: '🚊 Commuter friendly',
    good_for_ebikes: '⚡ Good for e-bikes',
    family_rides: '👨‍👩‍👧 Family rides',
    green_space: '🌳 Green space'
  };
  return tags[tag] || tag;
}

/**
 * Get tag type (positive, warning, neutral)
 */
function getTagType(tag) {
  const warningTags = ['door_zone_risk', 'high_traffic', 'avoid_in_peak', 'heavy_loading_zone'];
  const positiveTags = ['good_at_night', 'family_friendly', 'commuter_friendly', 'good_for_ebikes', 'green_space', 'family_rides'];

  if (warningTags.includes(tag)) return 'warning';
  if (positiveTags.includes(tag)) return 'positive';
  return 'neutral';
}

// ============================================
// CITY OF SYDNEY LGA BOUNDS
// ============================================
const SYDNEY_LGA_BOUNDS = {
  north: -33.8400,
  south: -33.9200,
  east: 151.2500,
  west: 151.1700
};

const SYDNEY_CENTER = { lat: -33.8688, lng: 151.2093 };
