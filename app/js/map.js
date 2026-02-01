/**
 * MICRO2MOVE SYDNEY - Google Maps Integration
 * City of Sydney Bike Waze App
 *
 * This file handles all Google Maps API interactions.
 * Developer: Replace YOUR_API_KEY in index.html with your actual Google Maps API key.
 */

// ============================================
// MAP INSTANCES
// ============================================
let mainMap = null;
let routeMap = null;
let feedMap = null;

// Store references to map objects
let segmentPolylines = [];
let plannedPolylines = [];
let segmentMarkers = [];
let eventMarkers = [];
let poiMarkers = [];

// Currently selected segment/project
let selectedSegment = null;
let selectedProject = null;

// Current view mode
let currentView = 'current'; // 'current', 'future', 'all'

// ============================================
// MAP STYLES
// ============================================
const LIGHT_MAP_STYLES = [
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#e9e9e9" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#e5e7eb" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#d1fae5" }]
  },
  {
    "featureType": "transit",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "poi.business",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [{ "visibility": "off" }]
  }
];

// ============================================
// INITIALIZE MAP
// ============================================
function initMap() {
  console.log('Initializing Google Maps...');

  // Check if Google Maps loaded
  if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
    console.error('Google Maps API not loaded. Please check your API key.');
    showMapFallback();
    return;
  }

  // Initialize main map
  initMainMap();

  // Initialize route map
  initRouteMap();

  // Initialize feed map
  initFeedMap();

  console.log('Maps initialized successfully');
}

/**
 * Initialize the main browse map
 */
function initMainMap() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  mainMap = new google.maps.Map(mapContainer, {
    center: SYDNEY_CENTER,
    zoom: 14,
    restriction: {
      latLngBounds: SYDNEY_LGA_BOUNDS,
      strictBounds: false
    },
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_CENTER
    },
    styles: LIGHT_MAP_STYLES
  });

  // Add existing segments to map (from data.js)
  addSegmentsToMap(mainMap);

  // Add planned cycleways to map (from data-planned.js)
  addPlannedCyclewaysToMap(mainMap);

  // Add POIs to map
  addPoisToMap(mainMap);

  // Add click listener to close cards when clicking map
  mainMap.addListener('click', () => {
    hideSegmentCard();
    hideProjectCard();
  });

  // Set initial view to 'current'
  switchNetworkView('current');
}

/**
 * Initialize the route planning map
 */
function initRouteMap() {
  const mapContainer = document.getElementById('routeMap');
  if (!mapContainer) return;

  routeMap = new google.maps.Map(mapContainer, {
    center: SYDNEY_CENTER,
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: false,
    styles: LIGHT_MAP_STYLES
  });
}

/**
 * Initialize the community feed map
 */
function initFeedMap() {
  const mapContainer = document.getElementById('feedMap');
  if (!mapContainer) return;

  feedMap = new google.maps.Map(mapContainer, {
    center: SYDNEY_CENTER,
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: false,
    gestureHandling: 'cooperative',
    styles: LIGHT_MAP_STYLES
  });

  // Add event markers
  addEventMarkersToMap(feedMap);
}

// ============================================
// ADD SEGMENTS TO MAP
// ============================================
function addSegmentsToMap(map) {
  SEGMENTS.forEach(segment => {
    // Create polyline for segment
    const polyline = new google.maps.Polyline({
      path: segment.coordinates,
      strokeColor: getFacilityColor(segment.facility_type),
      strokeOpacity: getOpacityFromComfort(segment.comfort_score),
      strokeWeight: 5,
      map: map,
      zIndex: getZIndexFromRisk(segment.crash_risk_score)
    });

    // Store reference
    polyline.segmentId = segment.id;
    segmentPolylines.push(polyline);

    // Add click listener
    polyline.addListener('click', () => {
      selectSegment(segment);
    });

    // Add hover effect
    polyline.addListener('mouseover', () => {
      polyline.setOptions({ strokeWeight: 8 });
    });

    polyline.addListener('mouseout', () => {
      if (selectedSegment?.id !== segment.id) {
        polyline.setOptions({ strokeWeight: 5 });
      }
    });
  });
}

/**
 * Get opacity based on comfort score
 */
function getOpacityFromComfort(score) {
  if (score >= 0.8) return 1.0;
  if (score >= 0.6) return 0.85;
  if (score >= 0.4) return 0.7;
  if (score >= 0.2) return 0.55;
  return 0.4;
}

/**
 * Get z-index based on risk (higher risk = lower z-index so safe routes show on top)
 */
function getZIndexFromRisk(score) {
  return Math.round((1 - score) * 100);
}

// ============================================
// ADD POIs TO MAP
// ============================================
function addPoisToMap(map) {
  POIS.forEach(poi => {
    const icon = getPoiIcon(poi.type);

    const marker = new google.maps.Marker({
      position: poi.location,
      map: map,
      title: poi.name,
      icon: {
        url: `data:image/svg+xml,${encodeURIComponent(createPoiSvg(poi.type))}`,
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16)
      }
    });

    marker.poiId = poi.id;
    poiMarkers.push(marker);

    marker.addListener('click', () => {
      showPoiInfo(poi);
    });
  });
}

/**
 * Create SVG for POI marker
 */
function createPoiSvg(type) {
  const colors = {
    bike_rack: '#3B82F6',
    bike_shed: '#22C55E',
    major_destination: '#A855F7',
    station_entrance: '#F59E0B'
  };
  const color = colors[type] || '#6B7280';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
    <text x="16" y="21" text-anchor="middle" font-size="14" fill="white">${getPoiIcon(type)}</text>
  </svg>`;
}

/**
 * Get POI icon
 */
function getPoiIcon(type) {
  const icons = {
    bike_rack: '🅿️',
    bike_shed: '🔒',
    major_destination: '📍',
    station_entrance: '🚉',
    micromobility_hub: '⚡'
  };
  return icons[type] || '📍';
}

// ============================================
// ADD EVENT MARKERS TO MAP
// ============================================
function addEventMarkersToMap(map) {
  EVENTS.forEach(event => {
    if (!event.location) return;

    const marker = new google.maps.Marker({
      position: event.location,
      map: map,
      title: getEventTitle(event),
      icon: {
        url: `data:image/svg+xml,${encodeURIComponent(createEventSvg(event.event_type))}`,
        scaledSize: new google.maps.Size(28, 28),
        anchor: new google.maps.Point(14, 14)
      }
    });

    marker.eventId = event.id;
    eventMarkers.push(marker);
  });
}

/**
 * Create SVG for event marker
 */
function createEventSvg(eventType) {
  const colors = {
    glass: '#F59E0B',
    pothole: '#6B7280',
    closed: '#EF4444',
    construction: '#F97316',
    door_zone_risk: '#EF4444',
    near_miss: '#EF4444',
    good_infra: '#22C55E',
    rack_full: '#3B82F6'
  };
  const color = colors[eventType] || '#6B7280';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="12" fill="${color}" stroke="white" stroke-width="2"/>
    <text x="14" y="19" text-anchor="middle" font-size="12" fill="white">${getEventIcon(eventType)}</text>
  </svg>`;
}

// ============================================
// SELECT SEGMENT
// ============================================
function selectSegment(segment) {
  selectedSegment = segment;

  // Highlight selected polyline
  segmentPolylines.forEach(polyline => {
    if (polyline.segmentId === segment.id) {
      polyline.setOptions({
        strokeWeight: 8,
        strokeOpacity: 1
      });
    } else {
      polyline.setOptions({
        strokeWeight: 5,
        strokeOpacity: getOpacityFromComfort(
          SEGMENTS.find(s => s.id === polyline.segmentId)?.comfort_score || 0.5
        )
      });
    }
  });

  // Center map on segment
  if (mainMap && segment.center) {
    mainMap.panTo(segment.center);
  }

  // Show segment card
  showSegmentCard(segment);
}

// ============================================
// SHOW/HIDE SEGMENT CARD
// ============================================
function showSegmentCard(segment) {
  const card = document.getElementById('segmentCard');
  if (!card) return;

  // Update card content
  document.getElementById('segmentIcon').textContent = getFacilityIcon(segment.facility_type);
  document.getElementById('segmentTitle').textContent = segment.road_name;
  document.getElementById('segmentSubtitle').textContent =
    `${segment.local_area} • ${formatFacilityType(segment.facility_type)}${segment.lane_width_m ? ` • ${segment.lane_width_m}m wide` : ''}`;
  document.getElementById('segmentRating').textContent = segment.avg_user_rating.toFixed(1);
  document.getElementById('segmentRatingCount').textContent = `(${segment.rating_count})`;

  // Stats
  document.getElementById('statComfort').textContent = `${Math.round(segment.comfort_score * 100)}%`;
  document.getElementById('statRisk').textContent = getRiskLabel(segment.crash_risk_score);
  document.getElementById('statTrips').textContent = formatNumber(segment.daily_bike_trips);

  // Count open events for this segment
  const openEvents = EVENTS.filter(e => e.segment_id === segment.id && e.status === 'open').length;
  document.getElementById('statIssues').textContent = openEvents.toString();

  // Tags
  const tagsContainer = document.getElementById('segmentTags');
  tagsContainer.innerHTML = segment.tags.map(tag =>
    `<span class="tag tag--${getTagType(tag)}">${getTagDisplay(tag)}</span>`
  ).join('');

  // Show card
  card.classList.add('visible');

  // Hide FAB
  document.getElementById('quickNoteBtn').style.display = 'none';
}

function hideSegmentCard() {
  const card = document.getElementById('segmentCard');
  if (card) {
    card.classList.remove('visible');
  }

  // Reset polyline styles
  segmentPolylines.forEach(polyline => {
    const segment = SEGMENTS.find(s => s.id === polyline.segmentId);
    if (segment) {
      polyline.setOptions({
        strokeWeight: 5,
        strokeOpacity: getOpacityFromComfort(segment.comfort_score)
      });
    }
  });

  selectedSegment = null;

  // Show FAB
  document.getElementById('quickNoteBtn').style.display = 'flex';
}

// ============================================
// FORMAT HELPERS
// ============================================
function formatFacilityType(type) {
  const types = {
    separated_cycleway: 'Separated',
    painted_lane: 'Painted lane',
    shared_path: 'Shared path',
    mixed_traffic: 'Shared road'
  };
  return types[type] || type;
}

// ============================================
// FILTER SEGMENTS BY TYPE
// ============================================
function filterSegmentsByType(type) {
  segmentPolylines.forEach(polyline => {
    const segment = SEGMENTS.find(s => s.id === polyline.segmentId);
    if (!segment) return;

    if (type === 'all' || segment.facility_type === type) {
      polyline.setVisible(true);
    } else {
      polyline.setVisible(false);
    }
  });
}

// ============================================
// SHOW POI INFO
// ============================================
function showPoiInfo(poi) {
  // For now, show a simple alert - in production, this would open a detail sheet
  console.log('POI selected:', poi);
  showToast(`${poi.name} - ${poi.capacity || 'N/A'} spots`);
}

// ============================================
// FALLBACK FOR NO API KEY
// ============================================
function showMapFallback() {
  const containers = ['map', 'routeMap', 'feedMap'];
  containers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#f3f4f6;color:#6b7280;text-align:center;padding:20px;">
          <div style="font-size:48px;margin-bottom:16px;">🗺️</div>
          <h3 style="margin-bottom:8px;">Map Loading...</h3>
          <p style="font-size:14px;">Add your Google Maps API key to enable the map.</p>
          <p style="font-size:12px;margin-top:8px;">See README.md for instructions.</p>
        </div>
      `;
    }
  });
}

// ============================================
// ADD PLANNED CYCLEWAYS TO MAP
// ============================================
function addPlannedCyclewaysToMap(map) {
  if (typeof PLANNED_CYCLEWAYS === 'undefined') return;

  PLANNED_CYCLEWAYS.forEach(project => {
    if (!project.coordinates || project.coordinates.length < 2) return;

    const polyline = new google.maps.Polyline({
      path: project.coordinates,
      strokeColor: getStatusColor(project.status),
      strokeOpacity: 0.9,
      strokeWeight: 6,
      strokePattern: getStrokePattern(project.status),
      map: null, // Hidden by default
      zIndex: 50
    });

    // Add dashed effect for planned/proposed
    if (project.status === 'planned' || project.status === 'proposed') {
      polyline.setOptions({
        strokeOpacity: 0,
        icons: [{
          icon: {
            path: 'M 0,-1 0,1',
            strokeOpacity: 0.8,
            strokeWeight: 6,
            scale: 4
          },
          offset: '0',
          repeat: '20px'
        }]
      });
    }

    polyline.projectId = project.id;
    plannedPolylines.push(polyline);

    // Add click listener
    polyline.addListener('click', () => {
      selectProject(project);
    });

    // Hover effect
    polyline.addListener('mouseover', () => {
      polyline.setOptions({ strokeWeight: 10 });
    });

    polyline.addListener('mouseout', () => {
      polyline.setOptions({ strokeWeight: 6 });
    });
  });

  // Also add existing cycleways from planned data
  if (typeof EXISTING_CYCLEWAYS !== 'undefined') {
    EXISTING_CYCLEWAYS.forEach(cycleway => {
      if (!cycleway.coordinates || cycleway.coordinates.length < 2) return;

      const polyline = new google.maps.Polyline({
        path: cycleway.coordinates,
        strokeColor: '#22C55E',
        strokeOpacity: 1,
        strokeWeight: 5,
        map: map,
        zIndex: 100
      });

      polyline.projectId = cycleway.id;
      polyline.isExisting = true;
      plannedPolylines.push(polyline);

      polyline.addListener('click', () => {
        selectProject(cycleway);
      });
    });
  }
}

function getStrokePattern(status) {
  // Dashed for planned, solid for others
  if (status === 'planned' || status === 'proposed') {
    return [10, 10];
  }
  return null;
}

// ============================================
// SWITCH NETWORK VIEW
// ============================================
function switchNetworkView(view) {
  currentView = view;

  plannedPolylines.forEach(polyline => {
    const project = [...(PLANNED_CYCLEWAYS || []), ...(EXISTING_CYCLEWAYS || [])]
      .find(p => p.id === polyline.projectId);

    if (!project) return;

    let shouldShow = false;

    switch (view) {
      case 'current':
        // Show only existing
        shouldShow = project.status === 'existing';
        break;
      case 'future':
        // Show existing + under construction + funded
        shouldShow = ['existing', 'completed_2026', 'under_construction', 'funded'].includes(project.status);
        break;
      case 'all':
        // Show everything
        shouldShow = true;
        break;
    }

    polyline.setMap(shouldShow ? mainMap : null);
  });

  // Update stats banner
  updateNetworkStats(view);
}

function updateNetworkStats(view) {
  // This would update the network stats banner
  // For now, handled by the UI
}

// ============================================
// SELECT PROJECT
// ============================================
function selectProject(project) {
  selectedProject = project;
  showProjectCard(project);
}

function showProjectCard(project) {
  // Hide segment card if visible
  hideSegmentCard();

  // Create or update project card
  let card = document.getElementById('projectCard');

  if (!card) {
    card = document.createElement('div');
    card.id = 'projectCard';
    card.className = 'project-card';
    document.querySelector('.screen--map').appendChild(card);
  }

  const statusLabel = typeof getStatusLabel === 'function' ? getStatusLabel(project.status) : project.status;
  const statusIcon = typeof getStatusIcon === 'function' ? getStatusIcon(project.status) : '📍';
  const budget = typeof formatBudget === 'function' ? formatBudget(project.budget_aud) : (project.budget_aud || 'TBC');

  card.innerHTML = `
    <div class="project-card__status project-card__status--${project.status}">
      ${statusIcon} ${statusLabel}
    </div>
    <h3 class="project-card__title">${project.name}</h3>
    <p class="project-card__meta">
      ${project.local_areas?.join(', ') || ''} • ${project.length_km ? project.length_km + ' km' : ''}
    </p>
    <p class="project-card__description">${project.description || ''}</p>

    <div class="project-card__stats">
      <div class="project-stat">
        <span class="project-stat__value">${budget}</span>
        <span class="project-stat__label">Budget</span>
      </div>
      <div class="project-stat">
        <span class="project-stat__value">${project.expected_completion || project.completion_date || 'TBC'}</span>
        <span class="project-stat__label">Completion</span>
      </div>
      <div class="project-stat">
        <span class="project-stat__value">${project.facility_type === 'separated_cycleway' ? 'Protected' : 'Shared'}</span>
        <span class="project-stat__label">Type</span>
      </div>
    </div>

    ${project.benefits ? `
      <div class="project-card__benefits">
        <h4>Benefits</h4>
        <ul>
          ${project.benefits.map(b => `<li>${b}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    ${project.connects_to ? `
      <p style="font-size:14px;color:#6B7280;">
        <strong>Connects to:</strong> ${project.connects_to.join(', ')}
      </p>
    ` : ''}
  `;

  card.classList.add('visible');

  // Pan map to project
  if (mainMap && project.coordinates && project.coordinates.length > 0) {
    const midIdx = Math.floor(project.coordinates.length / 2);
    mainMap.panTo(project.coordinates[midIdx]);
  }
}

function hideProjectCard() {
  const card = document.getElementById('projectCard');
  if (card) {
    card.classList.remove('visible');
  }
  selectedProject = null;
}

// ============================================
// FILTER BY STATUS
// ============================================
function filterByStatus(status) {
  plannedPolylines.forEach(polyline => {
    const project = [...(PLANNED_CYCLEWAYS || []), ...(EXISTING_CYCLEWAYS || [])]
      .find(p => p.id === polyline.projectId);

    if (!project) return;

    if (status === 'all' || project.status === status) {
      polyline.setMap(mainMap);
    } else {
      polyline.setMap(null);
    }
  });
}

// Make initMap globally available for Google Maps callback
window.initMap = initMap;
window.switchNetworkView = switchNetworkView;
window.filterByStatus = filterByStatus;
