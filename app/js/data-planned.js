/**
 * MICRO2MOVE SYDNEY - Planned Cycleways Data
 *
 * Official planned cycling infrastructure from:
 * - City of Sydney Cycling Strategy
 * - TfNSW Strategic Cycleway Corridors
 * - Individual project announcements
 *
 * Last updated: February 2026
 */

// ============================================
// PROJECT STATUS TYPES
// ============================================
const PROJECT_STATUS = {
  EXISTING: 'existing',           // Built and operational
  UNDER_CONSTRUCTION: 'under_construction', // Currently being built
  FUNDED: 'funded',               // Approved and funded, not yet started
  PLANNED: 'planned',             // In planning, not yet funded
  PROPOSED: 'proposed',           // Proposed/under investigation
  COMPLETED_2026: 'completed_2026' // Completed in 2026
};

// ============================================
// PLANNED CYCLEWAYS - CITY OF SYDNEY
// ============================================
const PLANNED_CYCLEWAYS = [
  // ========== COMPLETED 2026 ==========
  {
    id: "proj_harbour_bridge",
    name: "Sydney Harbour Bridge Cycleway",
    description: "Step-free ramp access replacing steep staircase. Connects North Sydney to CBD.",
    status: PROJECT_STATUS.COMPLETED_2026,
    completion_date: "2026-01-05",
    budget_aud: 39000000,
    source: "Transport for NSW",
    facility_type: "separated_cycleway",
    local_areas: ["Sydney CBD", "Milsons Point"],
    length_km: 1.2,
    coordinates: [
      { lat: -33.8523, lng: 151.2108 },
      { lat: -33.8500, lng: 151.2105 },
      { lat: -33.8480, lng: 151.2100 },
      { lat: -33.8460, lng: 151.2095 }
    ],
    benefits: [
      "30% increase in cycling trips expected",
      "Removes 50-step climb barrier",
      "Connects to North Sydney cycleway network"
    ],
    links: {
      project_page: "https://www.transport.nsw.gov.au/projects/harbour-bridge-cycleway"
    }
  },

  // ========== UNDER CONSTRUCTION ==========
  {
    id: "proj_king_street",
    name: "King Street Cycleway Extension",
    description: "Extending separated cycleway on King Street between Clarence Street and Pitt Street.",
    status: PROJECT_STATUS.UNDER_CONSTRUCTION,
    construction_start: "2025-04-14",
    expected_completion: "2026-06",
    source: "Transport for NSW",
    facility_type: "separated_cycleway",
    local_areas: ["Sydney CBD"],
    length_km: 0.4,
    coordinates: [
      { lat: -33.8678, lng: 151.2055 },
      { lat: -33.8680, lng: 151.2070 },
      { lat: -33.8682, lng: 151.2085 }
    ],
    connects_to: ["Castlereagh Street Cycleway", "College Street Cycleway"],
    benefits: [
      "East-west CBD connection",
      "Links to Castlereagh and College Street cycleways"
    ],
    links: {
      project_page: "https://www.transport.nsw.gov.au/projects/current-projects/king-street-cycleway"
    }
  },

  // ========== FUNDED ==========
  {
    id: "proj_oxford_street_west",
    name: "Oxford Street West Cycleway",
    description: "Two-way separated cycleway along Oxford Street west and Liverpool Street. One of Sydney's busiest cycling corridors with 3,000 daily riders.",
    status: PROJECT_STATUS.FUNDED,
    budget_aud: 9300000,
    expected_start: "2025",
    expected_completion: "2026",
    source: "City of Sydney",
    facility_type: "separated_cycleway",
    local_areas: ["Darlinghurst", "Surry Hills"],
    length_km: 1.8,
    coordinates: [
      { lat: -33.8785, lng: 151.2130 },
      { lat: -33.8780, lng: 151.2160 },
      { lat: -33.8775, lng: 151.2190 },
      { lat: -33.8770, lng: 151.2220 },
      { lat: -33.8765, lng: 151.2250 }
    ],
    connects_to: ["Liverpool Street", "Oxford Street East (Waverley)"],
    benefits: [
      "Serves 3,000 daily cyclists",
      "Connects to Bondi via Oxford Street East",
      "Two-way separated design"
    ],
    links: {
      project_page: "https://www.cityofsydney.nsw.gov.au/improving-streets-public-spaces/bike-network"
    }
  },
  {
    id: "proj_castlereagh_extension",
    name: "Castlereagh Street Cycleway Extension",
    description: "Extension connecting Liverpool Street route and existing southern Castlereagh Street cycleway.",
    status: PROJECT_STATUS.FUNDED,
    budget_aud: 9600000,
    expected_start: "2025",
    expected_completion: "2026",
    source: "City of Sydney",
    facility_type: "separated_cycleway",
    local_areas: ["Sydney CBD"],
    length_km: 0.8,
    coordinates: [
      { lat: -33.8720, lng: 151.2095 },
      { lat: -33.8750, lng: 151.2100 },
      { lat: -33.8780, lng: 151.2105 }
    ],
    connects_to: ["Liverpool Street Cycleway", "Existing Castlereagh Street Cycleway"],
    benefits: [
      "Completes north-south CBD spine",
      "Links multiple east-west routes"
    ]
  },

  // ========== PLANNED ==========
  {
    id: "proj_odea_avenue",
    name: "O'Dea Avenue Cycleway",
    description: "Two-way separated cycleway on northern side of O'Dea Avenue between Bourke Street and Gadigal Avenue.",
    status: PROJECT_STATUS.PLANNED,
    source: "City of Sydney",
    facility_type: "separated_cycleway",
    local_areas: ["Waterloo", "Zetland"],
    length_km: 1.2,
    coordinates: [
      { lat: -33.9050, lng: 151.2100 },
      { lat: -33.9048, lng: 151.2130 },
      { lat: -33.9045, lng: 151.2160 },
      { lat: -33.9042, lng: 151.2190 }
    ],
    connects_to: ["Bourke Street Cycleway", "Gadigal Avenue"],
    benefits: [
      "East-west connection in Green Square",
      "Links popular existing routes"
    ]
  },
  {
    id: "proj_ultimo_surry_hills",
    name: "Ultimo to Surry Hills via Haymarket",
    description: "Separated cycleway on Ultimo Road plus low-speed quiet-way on Thomas Street in Haymarket.",
    status: PROJECT_STATUS.PLANNED,
    source: "City of Sydney",
    facility_type: "separated_cycleway",
    local_areas: ["Ultimo", "Haymarket", "Surry Hills"],
    length_km: 1.5,
    coordinates: [
      { lat: -33.8795, lng: 151.1985 },
      { lat: -33.8800, lng: 151.2010 },
      { lat: -33.8810, lng: 151.2040 },
      { lat: -33.8820, lng: 151.2070 }
    ],
    connects_to: ["Pyrmont Bridge", "Central Station"],
    benefits: [
      "Connects UTS/Ultimo to Surry Hills",
      "Alternative to Broadway"
    ]
  },
  {
    id: "proj_wellington_street",
    name: "Wellington Street Cycleway",
    description: "New separated cycleway link in Waterloo, connecting to George Street cycleway and future Waterloo Metro station.",
    status: PROJECT_STATUS.PLANNED,
    source: "City of Sydney",
    facility_type: "separated_cycleway",
    local_areas: ["Waterloo"],
    length_km: 0.6,
    coordinates: [
      { lat: -33.9000, lng: 151.2050 },
      { lat: -33.9010, lng: 151.2055 },
      { lat: -33.9020, lng: 151.2060 }
    ],
    connects_to: ["George Street Cycleway", "Waterloo Metro Station"],
    benefits: [
      "Metro station connection",
      "Improves Waterloo area safety"
    ]
  },

  // ========== STRATEGIC CORRIDORS (TfNSW) ==========
  {
    id: "proj_corridor_college_street",
    name: "College Street Corridor",
    description: "Part of TfNSW Strategic Cycleway Corridors - north-south spine through eastern CBD.",
    status: PROJECT_STATUS.PROPOSED,
    source: "Transport for NSW - Strategic Cycleway Corridors",
    facility_type: "separated_cycleway",
    local_areas: ["Sydney CBD", "Darlinghurst"],
    length_km: 2.0,
    coordinates: [
      { lat: -33.8680, lng: 151.2130 },
      { lat: -33.8720, lng: 151.2135 },
      { lat: -33.8760, lng: 151.2140 },
      { lat: -33.8800, lng: 151.2145 }
    ],
    benefits: [
      "Strategic north-south corridor",
      "Connects Hyde Park to Surry Hills"
    ],
    links: {
      project_page: "https://www.transport.nsw.gov.au/operations/walking-and-bike-riding/strategic-cycleway-corridors"
    }
  },
  {
    id: "proj_corridor_anzac_bridge",
    name: "Anzac Bridge to CBD Corridor",
    description: "Strategic corridor connecting inner west to CBD via Anzac Bridge.",
    status: PROJECT_STATUS.PROPOSED,
    source: "Transport for NSW - Strategic Cycleway Corridors",
    facility_type: "separated_cycleway",
    local_areas: ["Pyrmont", "Sydney CBD"],
    length_km: 3.5,
    coordinates: [
      { lat: -33.8680, lng: 151.1850 },
      { lat: -33.8690, lng: 151.1900 },
      { lat: -33.8700, lng: 151.1950 },
      { lat: -33.8710, lng: 151.2000 }
    ],
    benefits: [
      "Major inner west connection",
      "High-demand commuter route"
    ]
  },
  {
    id: "proj_corridor_redfern_central",
    name: "Redfern to Central Corridor",
    description: "Strategic corridor connecting Redfern station precinct to Central.",
    status: PROJECT_STATUS.PROPOSED,
    source: "Transport for NSW - Strategic Cycleway Corridors",
    facility_type: "separated_cycleway",
    local_areas: ["Redfern", "Surry Hills", "Haymarket"],
    length_km: 1.8,
    coordinates: [
      { lat: -33.8915, lng: 151.2030 },
      { lat: -33.8880, lng: 151.2045 },
      { lat: -33.8845, lng: 151.2060 }
    ],
    benefits: [
      "Station-to-station connection",
      "Serves dense residential areas"
    ]
  }
];

// ============================================
// EXISTING CYCLEWAYS (for comparison)
// ============================================
const EXISTING_CYCLEWAYS = [
  {
    id: "exist_bourke_street",
    name: "Bourke Street Cycleway",
    status: PROJECT_STATUS.EXISTING,
    completion_date: "2015",
    facility_type: "separated_cycleway",
    local_areas: ["Surry Hills", "Redfern", "Waterloo"],
    length_km: 2.8,
    daily_trips: 1800,
    coordinates: [
      { lat: -33.8820, lng: 151.2100 },
      { lat: -33.8860, lng: 151.2130 },
      { lat: -33.8900, lng: 151.2160 },
      { lat: -33.8940, lng: 151.2180 }
    ]
  },
  {
    id: "exist_kent_street",
    name: "Kent Street Cycleway",
    status: PROJECT_STATUS.EXISTING,
    completion_date: "2012",
    facility_type: "separated_cycleway",
    local_areas: ["Sydney CBD"],
    length_km: 1.2,
    daily_trips: 2200,
    coordinates: [
      { lat: -33.8650, lng: 151.2040 },
      { lat: -33.8690, lng: 151.2045 },
      { lat: -33.8730, lng: 151.2050 }
    ]
  },
  {
    id: "exist_pyrmont_bridge",
    name: "Pyrmont Bridge Shared Path",
    status: PROJECT_STATUS.EXISTING,
    facility_type: "shared_path",
    local_areas: ["Pyrmont", "Sydney CBD"],
    length_km: 0.5,
    daily_trips: 3200,
    coordinates: [
      { lat: -33.8715, lng: 151.1985 },
      { lat: -33.8700, lng: 151.2000 },
      { lat: -33.8690, lng: 151.2020 }
    ]
  },
  {
    id: "exist_george_street",
    name: "George Street Cycleway",
    status: PROJECT_STATUS.EXISTING,
    facility_type: "separated_cycleway",
    local_areas: ["Redfern", "Waterloo"],
    length_km: 2.0,
    daily_trips: 1500,
    coordinates: [
      { lat: -33.8950, lng: 151.2030 },
      { lat: -33.9000, lng: 151.2045 },
      { lat: -33.9050, lng: 151.2060 }
    ]
  }
];

// ============================================
// NETWORK STATISTICS
// ============================================
const NETWORK_STATS = {
  current: {
    total_km: 35,
    separated_km: 22,
    shared_km: 8,
    painted_km: 5,
    daily_trips: 45000
  },
  planned_2026: {
    total_km: 48,
    separated_km: 38,
    shared_km: 8,
    painted_km: 2,
    estimated_daily_trips: 65000
  },
  strategic_2030: {
    total_km: 85,
    corridors: 30,
    estimated_daily_trips: 100000
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getStatusColor(status) {
  const colors = {
    [PROJECT_STATUS.EXISTING]: '#22C55E',        // Green
    [PROJECT_STATUS.COMPLETED_2026]: '#10B981',  // Teal
    [PROJECT_STATUS.UNDER_CONSTRUCTION]: '#F59E0B', // Amber
    [PROJECT_STATUS.FUNDED]: '#3B82F6',          // Blue
    [PROJECT_STATUS.PLANNED]: '#8B5CF6',         // Purple
    [PROJECT_STATUS.PROPOSED]: '#6B7280'         // Grey
  };
  return colors[status] || '#6B7280';
}

function getStatusLabel(status) {
  const labels = {
    [PROJECT_STATUS.EXISTING]: 'Open',
    [PROJECT_STATUS.COMPLETED_2026]: 'Opened 2026',
    [PROJECT_STATUS.UNDER_CONSTRUCTION]: 'Under Construction',
    [PROJECT_STATUS.FUNDED]: 'Funded',
    [PROJECT_STATUS.PLANNED]: 'Planned',
    [PROJECT_STATUS.PROPOSED]: 'Under Investigation'
  };
  return labels[status] || status;
}

function getStatusIcon(status) {
  const icons = {
    [PROJECT_STATUS.EXISTING]: '✅',
    [PROJECT_STATUS.COMPLETED_2026]: '🎉',
    [PROJECT_STATUS.UNDER_CONSTRUCTION]: '🚧',
    [PROJECT_STATUS.FUNDED]: '💰',
    [PROJECT_STATUS.PLANNED]: '📋',
    [PROJECT_STATUS.PROPOSED]: '🔍'
  };
  return icons[status] || '📍';
}

function formatBudget(amount) {
  if (!amount) return 'TBC';
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  return `$${(amount / 1000).toFixed(0)}K`;
}

function getAllCycleways() {
  return [...EXISTING_CYCLEWAYS, ...PLANNED_CYCLEWAYS];
}

function getCyclewaysByStatus(status) {
  return getAllCycleways().filter(c => c.status === status);
}

function getFutureNetwork() {
  return PLANNED_CYCLEWAYS.filter(c =>
    c.status !== PROJECT_STATUS.EXISTING
  );
}

// Export for use
if (typeof module !== 'undefined') {
  module.exports = {
    PROJECT_STATUS,
    PLANNED_CYCLEWAYS,
    EXISTING_CYCLEWAYS,
    NETWORK_STATS,
    getStatusColor,
    getStatusLabel,
    getStatusIcon,
    formatBudget,
    getAllCycleways,
    getCyclewaysByStatus,
    getFutureNetwork
  };
}
