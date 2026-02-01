/**
 * MICRO2MOVE SYDNEY - Community & POI Data
 * E-bike charging stations, bike shops, communities, comments
 */

// ============================================
// E-BIKE CHARGING STATIONS (LockyDock Sites)
// ============================================
const EBIKE_CHARGING_STATIONS = [
  {
    id: "charge_circular_quay",
    name: "Circular Quay Charging Hub",
    type: "charging_station",
    category: "transit_hub",
    location: { lat: -33.8608, lng: 151.2100 },
    address: "Circular Quay, Sydney NSW 2000",
    capacity: 12,
    available: 8,
    operator: "LockyDock",
    amenities: ["fast_charging", "secure_lock", "covered"],
    hours: "24/7",
    rating: 4.7,
    reviews: 89,
    upvotes: 156,
    downvotes: 12
  },
  {
    id: "charge_wynyard",
    name: "Wynyard Station E-Charge",
    type: "charging_station",
    category: "transit_hub",
    location: { lat: -33.8660, lng: 151.2070 },
    address: "Wynyard Station, York St, Sydney NSW 2000",
    capacity: 8,
    available: 5,
    operator: "LockyDock",
    amenities: ["fast_charging", "secure_lock"],
    hours: "5am - 1am",
    rating: 4.5,
    reviews: 67,
    upvotes: 124,
    downvotes: 8
  },
  {
    id: "charge_town_hall",
    name: "Town Hall Charging Point",
    type: "charging_station",
    category: "transit_hub",
    location: { lat: -33.8735, lng: 151.2070 },
    address: "Town Hall, George St, Sydney NSW 2000",
    capacity: 10,
    available: 3,
    operator: "LockyDock",
    amenities: ["fast_charging", "secure_lock", "repair_tools"],
    hours: "24/7",
    rating: 4.8,
    reviews: 112,
    upvotes: 203,
    downvotes: 15
  },
  {
    id: "charge_central",
    name: "Central Station E-Hub",
    type: "charging_station",
    category: "transit_hub",
    location: { lat: -33.8830, lng: 151.2065 },
    address: "Central Station, Eddy Ave, Sydney NSW 2000",
    capacity: 16,
    available: 10,
    operator: "LockyDock",
    amenities: ["fast_charging", "secure_lock", "covered", "repair_tools"],
    hours: "24/7",
    rating: 4.6,
    reviews: 145,
    upvotes: 267,
    downvotes: 23
  },
  {
    id: "charge_uts",
    name: "UTS Campus Charging",
    type: "charging_station",
    category: "university",
    location: { lat: -33.8833, lng: 151.1985 },
    address: "UTS, Broadway, Ultimo NSW 2007",
    capacity: 8,
    available: 6,
    operator: "LockyDock",
    amenities: ["fast_charging", "secure_lock", "student_discount"],
    hours: "6am - 11pm",
    rating: 4.4,
    reviews: 78,
    upvotes: 134,
    downvotes: 11
  },
  {
    id: "charge_usyd",
    name: "University of Sydney E-Station",
    type: "charging_station",
    category: "university",
    location: { lat: -33.8886, lng: 151.1873 },
    address: "Eastern Ave, University of Sydney NSW 2006",
    capacity: 12,
    available: 9,
    operator: "LockyDock",
    amenities: ["fast_charging", "secure_lock", "covered", "student_discount"],
    hours: "6am - 10pm",
    rating: 4.7,
    reviews: 93,
    upvotes: 178,
    downvotes: 9
  },
  {
    id: "charge_redfern",
    name: "Redfern Station Charging",
    type: "charging_station",
    category: "transit_hub",
    location: { lat: -33.8915, lng: 151.2000 },
    address: "Redfern Station, Lawson St, Redfern NSW 2016",
    capacity: 6,
    available: 4,
    operator: "LockyDock",
    amenities: ["fast_charging", "secure_lock"],
    hours: "5am - 12am",
    rating: 4.3,
    reviews: 54,
    upvotes: 89,
    downvotes: 14
  },
  {
    id: "charge_unsw",
    name: "UNSW Kensington Hub",
    type: "charging_station",
    category: "university",
    location: { lat: -33.9173, lng: 151.2313 },
    address: "UNSW, High St, Kensington NSW 2052",
    capacity: 14,
    available: 11,
    operator: "LockyDock",
    amenities: ["fast_charging", "secure_lock", "covered", "student_discount", "repair_tools"],
    hours: "24/7",
    rating: 4.8,
    reviews: 167,
    upvotes: 312,
    downvotes: 18
  }
];

// ============================================
// E-BIKE STORES & DEMO LOCATIONS
// ============================================
const EBIKE_STORES = [
  {
    id: "store_reid_sydney",
    name: "Reid Cycles Sydney",
    type: "ebike_store",
    location: { lat: -33.8795, lng: 151.2050 },
    address: "477 Kent St, Sydney NSW 2000",
    phone: "(02) 9283 1127",
    website: "reidcycles.com.au",
    services: ["sales", "demos", "repairs", "rentals"],
    brands: ["Reid", "Merida", "Giant"],
    demo_available: true,
    hours: "Mon-Fri 9-6, Sat 9-5, Sun 10-4",
    rating: 4.6,
    reviews: 234,
    upvotes: 189,
    downvotes: 23
  },
  {
    id: "store_99bikes_surry",
    name: "99 Bikes Surry Hills",
    type: "ebike_store",
    location: { lat: -33.8850, lng: 151.2120 },
    address: "212 Devonshire St, Surry Hills NSW 2010",
    phone: "(02) 9281 6633",
    website: "99bikes.com.au",
    services: ["sales", "demos", "repairs"],
    brands: ["Specialized", "Trek", "Cannondale"],
    demo_available: true,
    hours: "Mon-Fri 9-6, Sat 9-5, Sun 10-4",
    rating: 4.5,
    reviews: 312,
    upvotes: 245,
    downvotes: 31
  },
  {
    id: "store_electric_bikes",
    name: "Electric Bikes Sydney",
    type: "ebike_store",
    location: { lat: -33.8678, lng: 151.2028 },
    address: "113 Clarence St, Sydney NSW 2000",
    phone: "(02) 9267 3838",
    website: "electricbikessydney.com.au",
    services: ["sales", "demos", "repairs", "rentals", "tours"],
    brands: ["Brompton Electric", "Riese & Müller", "Tern"],
    demo_available: true,
    hours: "Mon-Fri 9-5:30, Sat 10-4",
    rating: 4.8,
    reviews: 178,
    upvotes: 267,
    downvotes: 12
  },
  {
    id: "store_lekker_newtown",
    name: "Lekker Bikes Newtown",
    type: "ebike_store",
    location: { lat: -33.8970, lng: 151.1790 },
    address: "282 King St, Newtown NSW 2042",
    phone: "(02) 9557 8881",
    website: "lekkerbikes.com.au",
    services: ["sales", "demos", "repairs"],
    brands: ["Lekker", "Urban Arrow", "Gazelle"],
    demo_available: true,
    hours: "Tue-Fri 10-6, Sat 9-5, Sun 10-4",
    rating: 4.7,
    reviews: 145,
    upvotes: 198,
    downvotes: 15
  },
  {
    id: "store_omafiets",
    name: "Omafiets Dutch Bikes",
    type: "ebike_store",
    location: { lat: -33.8920, lng: 151.1870 },
    address: "102 Regent St, Redfern NSW 2016",
    phone: "(02) 9698 7167",
    website: "omafiets.com.au",
    services: ["sales", "demos", "repairs"],
    brands: ["Gazelle", "Batavus", "Cortina"],
    demo_available: true,
    hours: "Tue-Sat 10-5",
    rating: 4.9,
    reviews: 89,
    upvotes: 156,
    downvotes: 4
  }
];

// ============================================
// BIKE COMMUNITIES
// ============================================
const BIKE_COMMUNITIES = [
  {
    id: "comm_sydney_bike",
    name: "Sydney Cycling Community",
    type: "community",
    description: "The largest cycling community in Sydney. Weekly rides, advocacy, and social events.",
    members: 12500,
    location: { lat: -33.8688, lng: 151.2093 },
    meeting_point: "Hyde Park Fountain",
    website: "sydneycycling.org",
    social: {
      facebook: "SydneyCyclingCommunity",
      instagram: "@sydneycycling",
      strava: "sydney-cycling-club"
    },
    rides: [
      { day: "Saturday", time: "7:00 AM", type: "Group Ride", difficulty: "All levels" },
      { day: "Wednesday", time: "6:00 PM", type: "After Work Spin", difficulty: "Intermediate" }
    ],
    focus: ["commuting", "advocacy", "social"],
    upvotes: 1234,
    downvotes: 45
  },
  {
    id: "comm_bicycle_nsw",
    name: "Bicycle NSW",
    type: "community",
    description: "Peak cycling advocacy body for NSW. Fighting for better infrastructure and cyclist rights.",
    members: 28000,
    location: { lat: -33.8750, lng: 151.2050 },
    meeting_point: "Various locations",
    website: "bicyclensw.org.au",
    social: {
      facebook: "BicycleNSW",
      instagram: "@bicyclensw",
      twitter: "@BicycleNSW"
    },
    rides: [
      { day: "Sunday", time: "8:00 AM", type: "Spring Cycle", difficulty: "All levels" }
    ],
    focus: ["advocacy", "events", "training"],
    upvotes: 2567,
    downvotes: 89
  },
  {
    id: "comm_dulwich_hill",
    name: "Dulwich Hill Bicycle Club",
    type: "community",
    description: "Inner west cycling club since 1908. Racing, training, and recreational rides.",
    members: 850,
    location: { lat: -33.9050, lng: 151.1390 },
    meeting_point: "Marrickville Oval",
    website: "dhbc.org.au",
    social: {
      facebook: "DulwichHillBicycleClub",
      strava: "dulwich-hill-bc"
    },
    rides: [
      { day: "Saturday", time: "6:30 AM", type: "Training Ride", difficulty: "Advanced" },
      { day: "Tuesday", time: "5:30 PM", type: "Criterium", difficulty: "Racing" }
    ],
    focus: ["racing", "training", "social"],
    upvotes: 456,
    downvotes: 12
  },
  {
    id: "comm_cargo_collective",
    name: "Sydney Cargo Bike Collective",
    type: "community",
    description: "For cargo bike enthusiasts, families, and businesses. Share tips, routes, and meet-ups.",
    members: 1200,
    location: { lat: -33.8970, lng: 151.1790 },
    meeting_point: "Newtown Square",
    website: "cargobikesydney.com.au",
    social: {
      facebook: "SydneyCargoBikes",
      instagram: "@sydneycargobikes"
    },
    rides: [
      { day: "Sunday", time: "10:00 AM", type: "Family Ride", difficulty: "Easy" }
    ],
    focus: ["cargo_bikes", "families", "sustainability"],
    upvotes: 678,
    downvotes: 23
  },
  {
    id: "comm_ebike_riders",
    name: "Sydney E-Bike Riders",
    type: "community",
    description: "E-bike owners and enthusiasts. Group rides, tech tips, and charging station updates.",
    members: 3400,
    location: { lat: -33.8830, lng: 151.2065 },
    meeting_point: "Central Station",
    website: "sydneyebikers.com",
    social: {
      facebook: "SydneyEBikeRiders",
      instagram: "@syd_ebike"
    },
    rides: [
      { day: "Saturday", time: "9:00 AM", type: "E-Bike Explorer", difficulty: "All levels" },
      { day: "Thursday", time: "6:30 PM", type: "Sunset Cruise", difficulty: "Easy" }
    ],
    focus: ["ebikes", "tech", "group_rides"],
    upvotes: 892,
    downvotes: 34
  }
];

// ============================================
// INFRASTRUCTURE COMMENTS
// ============================================
const INFRASTRUCTURE_COMMENTS = [
  {
    id: "comment_1",
    infrastructure_id: "exist_bourke_street",
    user: { name: "Alex M.", avatar: "A", verified: true },
    text: "Great protected lane, perfect for morning commutes! The separation from traffic makes it feel very safe.",
    rating: 5,
    timestamp: "2026-01-30T08:15:00Z",
    upvotes: 45,
    downvotes: 2,
    replies: [
      {
        user: { name: "Sam K.", avatar: "S" },
        text: "Agreed! Though watch out for delivery trucks near Devonshire St in the mornings.",
        timestamp: "2026-01-30T09:20:00Z",
        upvotes: 12,
        downvotes: 0
      }
    ]
  },
  {
    id: "comment_2",
    infrastructure_id: "exist_kent_street",
    user: { name: "Jordan P.", avatar: "J" },
    text: "Solid cycleway but gets congested during peak hours. Would love to see it widened.",
    rating: 4,
    timestamp: "2026-01-29T17:30:00Z",
    upvotes: 32,
    downvotes: 5,
    replies: []
  },
  {
    id: "comment_3",
    infrastructure_id: "proj_harbour_bridge",
    user: { name: "Chris T.", avatar: "C", verified: true },
    text: "The new ramp is AMAZING! No more carrying my bike up 50 stairs. Game changer for North Shore commuters.",
    rating: 5,
    timestamp: "2026-01-28T07:45:00Z",
    upvotes: 156,
    downvotes: 3,
    replies: [
      {
        user: { name: "Taylor R.", avatar: "T" },
        text: "Been waiting years for this! Finally accessible for everyone.",
        timestamp: "2026-01-28T08:10:00Z",
        upvotes: 67,
        downvotes: 0
      }
    ]
  },
  {
    id: "comment_4",
    infrastructure_id: "proj_king_street",
    user: { name: "Morgan L.", avatar: "M" },
    text: "Construction is a bit annoying right now but excited for when it's done. Will connect nicely to Castlereagh.",
    rating: 3,
    timestamp: "2026-01-27T12:00:00Z",
    upvotes: 23,
    downvotes: 4,
    replies: []
  },
  {
    id: "comment_5",
    infrastructure_id: "proj_oxford_street_west",
    user: { name: "Riley B.", avatar: "R" },
    text: "Can't wait for this! Oxford St is so dangerous right now. The funding announcement was great news.",
    rating: 4,
    timestamp: "2026-01-26T14:20:00Z",
    upvotes: 89,
    downvotes: 8,
    replies: []
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getAmenityIcon(amenity) {
  const icons = {
    'fast_charging': '⚡',
    'secure_lock': '🔒',
    'covered': '🏠',
    'repair_tools': '🔧',
    'student_discount': '🎓'
  };
  return icons[amenity] || '✓';
}

function getAmenityLabel(amenity) {
  const labels = {
    'fast_charging': 'Fast Charging',
    'secure_lock': 'Secure Lock',
    'covered': 'Covered',
    'repair_tools': 'Repair Tools',
    'student_discount': 'Student Discount'
  };
  return labels[amenity] || amenity;
}

function formatTimeAgo(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
  return date.toLocaleDateString();
}

function calculateVoteScore(upvotes, downvotes) {
  const total = upvotes + downvotes;
  if (total === 0) return 0;
  return Math.round((upvotes / total) * 100);
}

// Export for use
if (typeof module !== 'undefined') {
  module.exports = {
    EBIKE_CHARGING_STATIONS,
    EBIKE_STORES,
    BIKE_COMMUNITIES,
    INFRASTRUCTURE_COMMENTS,
    getAmenityIcon,
    getAmenityLabel,
    formatTimeAgo,
    calculateVoteScore
  };
}
