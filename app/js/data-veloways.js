/**
 * MICRO2MOVE SYDNEY - Eastern Sydney Regional Bike Network
 *
 * Veloway routes from the Eastern Sydney Regional Bike Network plan
 * Source: https://www.google.com/maps/d/viewer?mid=18LrGVELKm9obR7Xh_BH6_r7sAzc
 *
 * Last updated: February 2026
 */

// ============================================
// VELOWAY ROUTES - STRATEGIC CYCLING CORRIDORS
// ============================================
const VELOWAY_ROUTES = [
  {
    id: "velo_woolloomooloo_tempe",
    name: "Woolloomooloo - Tempe Veloway",
    description: "Major north-south corridor via Bourke St cycleway, Bourke Rd cycleway, Coward St shared path, and Alexandra Canal shared path.",
    status: "planned",
    facility_type: "veloway",
    length_km: 12.5,
    local_areas: ["Woolloomooloo", "Surry Hills", "Redfern", "Waterloo", "Zetland", "Rosebery", "Mascot", "Tempe"],
    connects_to: ["Bourke Street Cycleway", "Alexandra Canal Cycleway"],
    coordinates: [
      { lat: -33.8695, lng: 151.2220 }, // Woolloomooloo
      { lat: -33.8820, lng: 151.2100 }, // Surry Hills
      { lat: -33.8915, lng: 151.2030 }, // Redfern
      { lat: -33.9050, lng: 151.2100 }, // Waterloo/Zetland
      { lat: -33.9180, lng: 151.2050 }, // Rosebery
      { lat: -33.9280, lng: 151.1950 }, // Mascot
      { lat: -33.9420, lng: 151.1830 }  // Tempe
    ],
    benefits: [
      "Direct connection from harbour to Inner West",
      "Links major employment centers",
      "Connects to existing Bourke St infrastructure"
    ]
  },
  {
    id: "velo_bondi_junction_beach",
    name: "Bondi Junction - Bondi Beach Veloway",
    description: "City to Surf veloway connecting the major transport hub to Sydney's most famous beach.",
    status: "funded",
    facility_type: "veloway",
    length_km: 3.2,
    local_areas: ["Bondi Junction", "Bondi"],
    coordinates: [
      { lat: -33.8913, lng: 151.2473 }, // Bondi Junction
      { lat: -33.8920, lng: 151.2550 },
      { lat: -33.8910, lng: 151.2650 },
      { lat: -33.8908, lng: 151.2743 }  // Bondi Beach
    ],
    benefits: [
      "High-demand tourist and commuter route",
      "Connects train station to beach",
      "Part of City to Surf route"
    ]
  },
  {
    id: "velo_redfern_north_sydney",
    name: "Redfern - North Sydney Veloway",
    description: "CBD west link plus Harbour Bridge connection, creating a major north-south spine through the city.",
    status: "under_construction",
    facility_type: "veloway",
    length_km: 8.5,
    local_areas: ["Redfern", "Sydney CBD", "Milsons Point", "North Sydney"],
    connects_to: ["Sydney Harbour Bridge Cycleway", "Kent Street Cycleway"],
    coordinates: [
      { lat: -33.8915, lng: 151.2030 }, // Redfern
      { lat: -33.8800, lng: 151.2050 }, // Central
      { lat: -33.8700, lng: 151.2050 }, // Town Hall
      { lat: -33.8600, lng: 151.2080 }, // Wynyard
      { lat: -33.8523, lng: 151.2108 }, // Bridge south
      { lat: -33.8460, lng: 151.2095 }, // Bridge north
      { lat: -33.8390, lng: 151.2070 }  // North Sydney
    ],
    benefits: [
      "Direct CBD to North Shore connection",
      "Utilizes new Harbour Bridge ramp",
      "Major commuter corridor"
    ]
  },
  {
    id: "velo_glebe_darlinghurst",
    name: "Glebe - Darlinghurst Veloway",
    description: "City to Surf veloway providing east-west connectivity through the inner city.",
    status: "planned",
    facility_type: "veloway",
    length_km: 5.0,
    local_areas: ["Glebe", "Ultimo", "Haymarket", "Surry Hills", "Darlinghurst"],
    coordinates: [
      { lat: -33.8790, lng: 151.1870 }, // Glebe
      { lat: -33.8795, lng: 151.1985 }, // Ultimo
      { lat: -33.8810, lng: 151.2040 }, // Haymarket
      { lat: -33.8820, lng: 151.2100 }, // Surry Hills
      { lat: -33.8785, lng: 151.2180 }  // Darlinghurst
    ],
    benefits: [
      "East-west inner city connection",
      "Links universities (USyd, UTS)",
      "Alternative to Broadway"
    ]
  },
  {
    id: "velo_erskineville_kensington",
    name: "Erskineville - Kensington Veloway",
    description: "Connecting the Inner West to the Eastern Suburbs through Green Square.",
    status: "planned",
    facility_type: "veloway",
    length_km: 6.0,
    local_areas: ["Erskineville", "Alexandria", "Zetland", "Kensington"],
    coordinates: [
      { lat: -33.9020, lng: 151.1860 }, // Erskineville
      { lat: -33.9100, lng: 151.1950 }, // Alexandria
      { lat: -33.9050, lng: 151.2100 }, // Zetland
      { lat: -33.9060, lng: 151.2220 }, // Moore Park
      { lat: -33.9150, lng: 151.2250 }  // Kensington
    ],
    benefits: [
      "Links Inner West line to UNSW",
      "Serves Green Square density",
      "Connection to Moore Park"
    ]
  },
  {
    id: "velo_tempe_ramsgate",
    name: "Tempe - Ramsgate Veloway",
    description: "Southern corridor including a section of the Botany Bay Trail from Alexandra Canal to Barton Park.",
    status: "planned",
    facility_type: "veloway",
    length_km: 8.0,
    local_areas: ["Tempe", "Arncliffe", "Rockdale", "Ramsgate"],
    connects_to: ["Botany Bay Trail", "Alexandra Canal Cycleway"],
    coordinates: [
      { lat: -33.9420, lng: 151.1830 }, // Tempe
      { lat: -33.9450, lng: 151.1700 }, // Wolli Creek
      { lat: -33.9520, lng: 151.1550 }, // Arncliffe
      { lat: -33.9600, lng: 151.1450 }, // Rockdale
      { lat: -33.9750, lng: 151.1400 }  // Ramsgate
    ],
    benefits: [
      "Extends network to Botany Bay",
      "Connects to Botany Bay Trail",
      "Serves southern suburbs"
    ]
  },
  {
    id: "velo_cbd_bondi_junction",
    name: "CBD - Bondi Junction Veloway",
    description: "City to Surf veloway - the premier east-west route connecting the CBD to the Eastern Suburbs hub.",
    status: "funded",
    facility_type: "veloway",
    length_km: 5.5,
    local_areas: ["Sydney CBD", "Darlinghurst", "Paddington", "Woollahra", "Bondi Junction"],
    connects_to: ["Oxford Street Cycleway", "College Street Cycleway"],
    coordinates: [
      { lat: -33.8688, lng: 151.2093 }, // CBD
      { lat: -33.8750, lng: 151.2150 }, // Hyde Park
      { lat: -33.8785, lng: 151.2180 }, // Darlinghurst
      { lat: -33.8850, lng: 151.2280 }, // Paddington
      { lat: -33.8890, lng: 151.2380 }, // Woollahra
      { lat: -33.8913, lng: 151.2473 }  // Bondi Junction
    ],
    benefits: [
      "Highest demand cycling corridor",
      "Connects CBD to Eastern Suburbs",
      "Major public transport interchange"
    ]
  },
  {
    id: "velo_darlinghurst_little_bay",
    name: "Darlinghurst - Little Bay Veloway",
    description: "Long-distance route connecting the inner city to the southeastern beaches.",
    status: "proposed",
    facility_type: "veloway",
    length_km: 14.0,
    local_areas: ["Darlinghurst", "Paddington", "Randwick", "Maroubra", "Little Bay"],
    coordinates: [
      { lat: -33.8785, lng: 151.2180 }, // Darlinghurst
      { lat: -33.8950, lng: 151.2350 }, // Centennial Park
      { lat: -33.9150, lng: 151.2400 }, // Randwick
      { lat: -33.9400, lng: 151.2450 }, // Maroubra
      { lat: -33.9750, lng: 151.2450 }  // Little Bay
    ],
    benefits: [
      "Connects to southeastern beaches",
      "Passes through Centennial Park",
      "Links hospital precinct"
    ]
  },
  {
    id: "velo_rozelle_double_bay",
    name: "Rozelle - Double Bay Cross City Veloway",
    description: "Cross City Veloway providing direct east-west connectivity through the CBD.",
    status: "planned",
    facility_type: "veloway",
    length_km: 7.0,
    local_areas: ["Rozelle", "Glebe", "Pyrmont", "Sydney CBD", "Potts Point", "Double Bay"],
    coordinates: [
      { lat: -33.8620, lng: 151.1720 }, // Rozelle
      { lat: -33.8700, lng: 151.1850 }, // Glebe
      { lat: -33.8700, lng: 151.1950 }, // Pyrmont
      { lat: -33.8688, lng: 151.2093 }, // CBD
      { lat: -33.8700, lng: 151.2220 }, // Potts Point
      { lat: -33.8780, lng: 151.2430 }  // Double Bay
    ],
    benefits: [
      "Cross-city east-west link",
      "Connects Inner West to Eastern Suburbs",
      "Alternative to congested roads"
    ]
  },
  {
    id: "velo_kensington_bronte",
    name: "Kensington - Bronte Veloway",
    description: "Connecting UNSW to the coastal beaches.",
    status: "planned",
    facility_type: "veloway",
    length_km: 4.5,
    local_areas: ["Kensington", "Randwick", "Clovelly", "Bronte"],
    coordinates: [
      { lat: -33.9150, lng: 151.2250 }, // Kensington/UNSW
      { lat: -33.9150, lng: 151.2400 }, // Randwick
      { lat: -33.9100, lng: 151.2550 }, // Clovelly
      { lat: -33.9040, lng: 151.2650 }  // Bronte
    ],
    benefits: [
      "UNSW to beach connection",
      "Popular recreational route",
      "Links to coastal walk"
    ]
  },
  {
    id: "velo_kensington_coogee",
    name: "Kensington - Coogee Veloway",
    description: "Direct route from UNSW to Coogee Beach.",
    status: "funded",
    facility_type: "veloway",
    length_km: 3.5,
    local_areas: ["Kensington", "Kingsford", "Coogee"],
    coordinates: [
      { lat: -33.9150, lng: 151.2250 }, // Kensington/UNSW
      { lat: -33.9230, lng: 151.2280 }, // Kingsford
      { lat: -33.9220, lng: 151.2550 }  // Coogee
    ],
    benefits: [
      "UNSW student commuter route",
      "Light rail integration",
      "Beach access"
    ]
  },
  {
    id: "velo_rose_bay_bondi",
    name: "Rose Bay - Bondi Beach Veloway",
    description: "Coastal veloway connecting the harbour suburbs to Bondi.",
    status: "proposed",
    facility_type: "veloway",
    length_km: 4.0,
    local_areas: ["Rose Bay", "Dover Heights", "North Bondi", "Bondi Beach"],
    coordinates: [
      { lat: -33.8700, lng: 151.2650 }, // Rose Bay
      { lat: -33.8750, lng: 151.2700 }, // Dover Heights
      { lat: -33.8850, lng: 151.2750 }, // North Bondi
      { lat: -33.8908, lng: 151.2743 }  // Bondi Beach
    ],
    benefits: [
      "Scenic coastal route",
      "Ferry connection at Rose Bay",
      "Tourist attraction"
    ]
  },
  {
    id: "velo_redfern_circular_quay",
    name: "Redfern - Circular Quay Veloway",
    description: "CBD east corridor providing direct access to the ferry hub.",
    status: "under_construction",
    facility_type: "veloway",
    length_km: 4.0,
    local_areas: ["Redfern", "Surry Hills", "Sydney CBD", "Circular Quay"],
    connects_to: ["College Street Cycleway"],
    coordinates: [
      { lat: -33.8915, lng: 151.2030 }, // Redfern
      { lat: -33.8820, lng: 151.2100 }, // Surry Hills
      { lat: -33.8700, lng: 151.2130 }, // Hyde Park
      { lat: -33.8610, lng: 151.2110 }  // Circular Quay
    ],
    benefits: [
      "Direct CBD east access",
      "Ferry interchange connection",
      "Links to Harbour Bridge"
    ]
  },
  {
    id: "velo_newtown_centennial",
    name: "Newtown - Centennial Park Veloway",
    description: "Connecting the Inner West cultural hub to Sydney's premier parkland.",
    status: "planned",
    facility_type: "veloway",
    length_km: 5.5,
    local_areas: ["Newtown", "Erskineville", "Waterloo", "Moore Park", "Centennial Park"],
    coordinates: [
      { lat: -33.8970, lng: 151.1790 }, // Newtown
      { lat: -33.9020, lng: 151.1860 }, // Erskineville
      { lat: -33.9050, lng: 151.2050 }, // Waterloo
      { lat: -33.8990, lng: 151.2200 }, // Moore Park
      { lat: -33.8950, lng: 151.2350 }  // Centennial Park
    ],
    benefits: [
      "Major recreational route",
      "Connects vibrant neighborhoods",
      "Park access for families"
    ]
  },
  {
    id: "velo_moore_park_link",
    name: "Moore Park South Link",
    description: "Key connection linking Moore Park sporting precinct to the southern network.",
    status: "funded",
    facility_type: "veloway",
    length_km: 2.0,
    local_areas: ["Moore Park", "Kensington"],
    coordinates: [
      { lat: -33.8990, lng: 151.2200 }, // Moore Park
      { lat: -33.9060, lng: 151.2220 },
      { lat: -33.9150, lng: 151.2250 }  // Kensington
    ],
    benefits: [
      "Stadium event access",
      "SCG and Allianz connection",
      "Links multiple veloways"
    ]
  },
  {
    id: "velo_redfern_botany",
    name: "Redfern - Botany Veloway",
    description: "Via Rosebery and Eastlakes, connecting to the airport precinct.",
    status: "planned",
    facility_type: "veloway",
    length_km: 8.0,
    local_areas: ["Redfern", "Zetland", "Rosebery", "Eastlakes", "Botany"],
    coordinates: [
      { lat: -33.8915, lng: 151.2030 }, // Redfern
      { lat: -33.9050, lng: 151.2100 }, // Zetland
      { lat: -33.9180, lng: 151.2050 }, // Rosebery
      { lat: -33.9300, lng: 151.2150 }, // Eastlakes
      { lat: -33.9450, lng: 151.2000 }  // Botany
    ],
    benefits: [
      "Airport worker commute",
      "Growing residential areas",
      "Industrial precinct access"
    ]
  },
  {
    id: "velo_bondi_junction_randwick",
    name: "Bondi Junction - Randwick Veloway",
    description: "Connecting two major Eastern Suburbs centers.",
    status: "planned",
    facility_type: "veloway",
    length_km: 3.5,
    local_areas: ["Bondi Junction", "Queens Park", "Randwick"],
    coordinates: [
      { lat: -33.8913, lng: 151.2473 }, // Bondi Junction
      { lat: -33.9000, lng: 151.2450 }, // Queens Park
      { lat: -33.9150, lng: 151.2400 }  // Randwick
    ],
    benefits: [
      "Hospital precinct access",
      "UNSW connection",
      "Shopping center links"
    ]
  },
  {
    id: "velo_randwick_pagewood",
    name: "Randwick - Pagewood Veloway",
    description: "Southern extension of the Randwick network.",
    status: "proposed",
    facility_type: "veloway",
    length_km: 4.0,
    local_areas: ["Randwick", "Kingsford", "Eastgardens", "Pagewood"],
    coordinates: [
      { lat: -33.9150, lng: 151.2400 }, // Randwick
      { lat: -33.9230, lng: 151.2280 }, // Kingsford
      { lat: -33.9400, lng: 151.2250 }, // Eastgardens
      { lat: -33.9450, lng: 151.2200 }  // Pagewood
    ],
    benefits: [
      "Shopping center access",
      "Light rail connection",
      "Residential area links"
    ]
  },
  {
    id: "velo_maroubra_mascot",
    name: "Maroubra Beach - Mascot Veloway",
    description: "Beach to airport corridor.",
    status: "proposed",
    facility_type: "veloway",
    length_km: 6.5,
    local_areas: ["Maroubra", "Pagewood", "Mascot"],
    coordinates: [
      { lat: -33.9500, lng: 151.2550 }, // Maroubra Beach
      { lat: -33.9450, lng: 151.2350 }, // Maroubra Junction
      { lat: -33.9450, lng: 151.2200 }, // Pagewood
      { lat: -33.9280, lng: 151.1950 }  // Mascot
    ],
    benefits: [
      "Beach to transit connection",
      "Airport worker route",
      "Growing corridor"
    ]
  },
  {
    id: "velo_mascot_tempe",
    name: "Mascot - Tempe Veloway",
    description: "Connecting airport precinct to the Inner West.",
    status: "planned",
    facility_type: "veloway",
    length_km: 3.0,
    local_areas: ["Mascot", "Tempe"],
    connects_to: ["Alexandra Canal Cycleway"],
    coordinates: [
      { lat: -33.9280, lng: 151.1950 }, // Mascot
      { lat: -33.9350, lng: 151.1880 },
      { lat: -33.9420, lng: 151.1830 }  // Tempe
    ],
    benefits: [
      "Airport connection",
      "Inner West link",
      "Canal path access"
    ]
  },
  {
    id: "velo_south_coogee_eastgardens",
    name: "South Coogee - Eastgardens Veloway",
    description: "Coastal to shopping center connection.",
    status: "proposed",
    facility_type: "veloway",
    length_km: 3.5,
    local_areas: ["South Coogee", "Matraville", "Eastgardens"],
    coordinates: [
      { lat: -33.9320, lng: 151.2580 }, // South Coogee
      { lat: -33.9380, lng: 151.2450 }, // Matraville
      { lat: -33.9400, lng: 151.2250 }  // Eastgardens
    ],
    benefits: [
      "Beach access",
      "Major shopping center",
      "Residential connections"
    ]
  },
  {
    id: "velo_alexandra_canal",
    name: "Alexandra Canal Cycleway",
    description: "Dedicated cycleway along Alexandra Canal, forming a key north-south spine.",
    status: "existing",
    facility_type: "separated_cycleway",
    length_km: 5.0,
    local_areas: ["St Peters", "Tempe", "Mascot"],
    coordinates: [
      { lat: -33.9150, lng: 151.1850 }, // St Peters
      { lat: -33.9280, lng: 151.1820 },
      { lat: -33.9420, lng: 151.1830 }  // Tempe
    ],
    daily_trips: 1200,
    benefits: [
      "Flat, car-free route",
      "Scenic canal views",
      "Key network spine"
    ]
  }
];

// ============================================
// KEY TRANSPORT HUBS
// ============================================
const VELOWAY_HUBS = [
  { id: "hub_central", name: "Central Station", type: "transport", location: { lat: -33.8832, lng: 151.2055 }, icon: "🚉" },
  { id: "hub_redfern", name: "Redfern Station", type: "transport", location: { lat: -33.8915, lng: 151.2030 }, icon: "🚉" },
  { id: "hub_green_square", name: "Green Square Station", type: "transport", location: { lat: -33.9065, lng: 151.2030 }, icon: "🚉" },
  { id: "hub_mascot", name: "Mascot Station", type: "transport", location: { lat: -33.9290, lng: 151.1870 }, icon: "🚉" },
  { id: "hub_kingsford_lr", name: "Kingsford LR Terminus", type: "transport", location: { lat: -33.9230, lng: 151.2280 }, icon: "🚋" },
  { id: "hub_edgecliff", name: "Edgecliff Station", type: "transport", location: { lat: -33.8790, lng: 151.2370 }, icon: "🚉" },
  { id: "hub_bondi_junction", name: "Bondi Junction Station", type: "transport", location: { lat: -33.8913, lng: 151.2473 }, icon: "🚉" },
  { id: "hub_domestic_terminal", name: "Domestic Terminal (T2)", type: "airport", location: { lat: -33.9350, lng: 151.1660 }, icon: "✈️" },
  { id: "hub_intl_terminal", name: "International Terminal (T1)", type: "airport", location: { lat: -33.9350, lng: 151.1630 }, icon: "✈️" }
];

// ============================================
// VILLAGE/PRECINCT DESTINATIONS
// ============================================
const VELOWAY_DESTINATIONS = [
  { id: "dest_bondi_junction_cbd", name: "Bondi Junction CBD", type: "shopping", location: { lat: -33.8913, lng: 151.2473 } },
  { id: "dest_bronte_village", name: "Bronte Village", type: "village", location: { lat: -33.9040, lng: 151.2650 } },
  { id: "dest_clovelly_village", name: "Clovelly Village", type: "village", location: { lat: -33.9100, lng: 151.2600 } },
  { id: "dest_randwick_cbd", name: "Randwick CBD", type: "shopping", location: { lat: -33.9150, lng: 151.2400 } },
  { id: "dest_zetland_village", name: "Zetland Village", type: "village", location: { lat: -33.9050, lng: 151.2100 } },
  { id: "dest_kensington_village", name: "Kensington Village", type: "village", location: { lat: -33.9150, lng: 151.2250 } },
  { id: "dest_mascot_village", name: "Mascot Village", type: "village", location: { lat: -33.9280, lng: 151.1950 } },
  { id: "dest_maroubra_junction", name: "Maroubra Junction", type: "shopping", location: { lat: -33.9450, lng: 151.2350 } },
  { id: "dest_kingsford_village", name: "Kingsford Village", type: "village", location: { lat: -33.9230, lng: 151.2280 } },
  { id: "dest_redfern_village", name: "Redfern Village", type: "village", location: { lat: -33.8920, lng: 151.2050 } },
  { id: "dest_newtown", name: "Newtown", type: "village", location: { lat: -33.8970, lng: 151.1790 } },
  { id: "dest_edgecliff_village", name: "Edgecliff Village", type: "village", location: { lat: -33.8790, lng: 151.2370 } },
  { id: "dest_danks_street", name: "Danks Street Precinct", type: "precinct", location: { lat: -33.9100, lng: 151.2050 } },
  { id: "dest_rosebery", name: "Rosebery", type: "precinct", location: { lat: -33.9180, lng: 151.2050 } }
];

// ============================================
// HELPER FUNCTIONS
// ============================================
function getVelowayStatusColor(status) {
  const colors = {
    'existing': '#22C55E',
    'under_construction': '#F59E0B',
    'funded': '#3B82F6',
    'planned': '#8B5CF6',
    'proposed': '#6B7280'
  };
  return colors[status] || '#6B7280';
}

function getVelowaysByStatus(status) {
  return VELOWAY_ROUTES.filter(v => v.status === status);
}

function getAllVeloways() {
  return VELOWAY_ROUTES;
}

// Export for use
if (typeof module !== 'undefined') {
  module.exports = {
    VELOWAY_ROUTES,
    VELOWAY_HUBS,
    VELOWAY_DESTINATIONS,
    getVelowayStatusColor,
    getVelowaysByStatus,
    getAllVeloways
  };
}
