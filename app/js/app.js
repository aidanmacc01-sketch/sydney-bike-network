/**
 * MICRO2MOVE SYDNEY - Main Application
 * City of Sydney Bike Waze App
 *
 * This file handles all UI interactions and app logic.
 */

// ============================================
// APP STATE
// ============================================
const AppState = {
  currentScreen: 'screenMap',
  selectedSegment: null,
  selectedReportType: null,
  userRating: 0
};

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Micro2Move Sydney - Future Cycling Network Visualizer');

  // Initialize navigation
  initNavigation();

  // Initialize network view toggle
  initNetworkToggle();

  // Initialize legend filters
  initLegendFilters();

  // Initialize bottom sheet
  initBottomSheet();

  // Initialize modals
  initModals();

  // Initialize route options
  initRouteOptions();

  // Initialize feed filters
  initFeedFilters();

  // Populate community feed
  populateCommunityFeed();

  // Initialize event listeners
  initEventListeners();
});

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const screenId = item.dataset.screen;
      switchScreen(screenId);

      // Update active nav
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

function switchScreen(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  // Show target screen
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    AppState.currentScreen = screenId;
  }

  // Close any open sheets
  closeBottomSheet();
}

// ============================================
// NETWORK VIEW TOGGLE
// ============================================
function initNetworkToggle() {
  const toggleBtns = document.querySelectorAll('.toggle-btn');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;

      // Update active state
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Switch network view on map
      if (typeof switchNetworkView === 'function') {
        switchNetworkView(view);
      }

      // Update stats display
      updateStatsDisplay(view);
    });
  });
}

function updateStatsDisplay(view) {
  // Update any stats banners based on view
  const stats = typeof NETWORK_STATS !== 'undefined' ? NETWORK_STATS : null;
  if (!stats) return;

  // Could update a stats banner here
  console.log('Network view:', view, stats[view === 'current' ? 'current' : view === 'future' ? 'planned_2026' : 'strategic_2030']);
}

// ============================================
// LEGEND FILTERS (Status-based)
// ============================================
function initLegendFilters() {
  const legendChips = document.querySelectorAll('.legend-chip');

  legendChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const status = chip.dataset.status;

      // Update active state
      legendChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      // Filter by status on map
      if (typeof filterByStatus === 'function') {
        filterByStatus(status);
      }
    });
  });
}

// ============================================
// BOTTOM SHEET
// ============================================
function initBottomSheet() {
  const sheet = document.getElementById('segmentSheet');
  const expandBtn = document.getElementById('expandSegmentBtn');

  if (expandBtn) {
    expandBtn.addEventListener('click', () => {
      if (selectedSegment) {
        openSegmentSheet(selectedSegment);
      }
    });
  }

  // Handle drag to close
  if (sheet) {
    let startY = 0;
    let currentY = 0;

    sheet.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    });

    sheet.addEventListener('touchmove', (e) => {
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      if (diff > 0) {
        sheet.style.transform = `translateY(${diff}px)`;
      }
    });

    sheet.addEventListener('touchend', () => {
      const diff = currentY - startY;
      if (diff > 100) {
        closeBottomSheet();
      } else {
        sheet.style.transform = '';
      }
    });
  }
}

function openSegmentSheet(segment) {
  const sheet = document.getElementById('segmentSheet');
  if (!sheet) return;

  // Populate sheet data
  populateSegmentSheet(segment);

  // Open sheet
  sheet.classList.add('open');
  sheet.style.transform = '';

  // Hide segment card
  hideSegmentCard();
}

function closeBottomSheet() {
  const sheet = document.getElementById('segmentSheet');
  if (sheet) {
    sheet.classList.remove('open');
  }
}

function populateSegmentSheet(segment) {
  // Badge
  const badge = document.getElementById('sheetBadge');
  if (segment.is_pop_up_cycleway) {
    badge.textContent = '🆕 POP-UP CYCLEWAY';
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }

  // Title and subtitle
  document.getElementById('sheetTitle').textContent = `${segment.road_name} ${formatFacilityType(segment.facility_type)}`;
  document.getElementById('sheetSubtitle').textContent = segment.local_area;

  // Rating
  document.getElementById('sheetRating').textContent = segment.avg_user_rating.toFixed(1);
  document.getElementById('sheetRatingCount').textContent = `(${segment.rating_count} ratings)`;

  // Score bars
  const comfortPercent = Math.round(segment.comfort_score * 100);
  const safetyPercent = Math.round(segment.perceived_safety_score * 100);
  const popularityPercent = Math.round(segment.popularity_score * 100);

  document.getElementById('sheetComfort').textContent = `${comfortPercent}%`;
  document.getElementById('sheetComfortBar').style.width = `${comfortPercent}%`;

  document.getElementById('sheetSafety').textContent = `${safetyPercent}%`;
  document.getElementById('sheetSafetyBar').style.width = `${safetyPercent}%`;

  document.getElementById('sheetPopularity').textContent = `${popularityPercent}%`;
  document.getElementById('sheetPopularityBar').style.width = `${popularityPercent}%`;

  // Info grid
  document.getElementById('sheetWidth').textContent = segment.lane_width_m ? `${segment.lane_width_m}m` : 'N/A';
  document.getElementById('sheetSpeed').textContent = `${segment.speed_env_kmh} km/h`;
  document.getElementById('sheetDailyTrips').textContent = segment.daily_bike_trips ? formatNumber(segment.daily_bike_trips) : 'N/A';
  document.getElementById('sheetGradient').textContent = capitalizeFirst(segment.gradient_class);
  document.getElementById('sheetLighting').textContent = capitalizeFirst(segment.lighting_quality);
  document.getElementById('sheetLoading').textContent = segment.heavy_loading_zone ? 'Yes' : 'No';

  // Tags
  const tagsContainer = document.getElementById('sheetTags');
  tagsContainer.innerHTML = segment.tags.map(tag =>
    `<span class="tag tag--${getTagType(tag)}">${getTagDisplay(tag)}</span>`
  ).join('');

  // Events for this segment
  const segmentEvents = EVENTS.filter(e => e.segment_id === segment.id);
  const eventsContainer = document.getElementById('sheetEvents');

  if (segmentEvents.length > 0) {
    eventsContainer.innerHTML = segmentEvents.map(event => createEventCardHtml(event)).join('');
  } else {
    eventsContainer.innerHTML = `
      <div class="empty-state" style="padding:24px;text-align:center;">
        <div style="font-size:32px;margin-bottom:8px;">✨</div>
        <p style="color:#6B7280;">All clear on this stretch!</p>
        <p style="color:#9CA3AF;font-size:12px;">No issues reported in the last 7 days.</p>
      </div>
    `;
  }

  // Store selected segment for rating
  AppState.selectedSegment = segment;
}

function formatFacilityType(type) {
  const types = {
    separated_cycleway: 'Protected Lane',
    painted_lane: 'Painted Lane',
    shared_path: 'Shared Path',
    mixed_traffic: 'Shared Road'
  };
  return types[type] || type;
}

// ============================================
// MODALS
// ============================================
function initModals() {
  // Report modal
  const reportModal = document.getElementById('reportModal');
  const closeReportBtn = document.getElementById('closeReportModal');
  const reportBackdrop = reportModal?.querySelector('.modal__backdrop');

  if (closeReportBtn) {
    closeReportBtn.addEventListener('click', () => closeModal('reportModal'));
  }
  if (reportBackdrop) {
    reportBackdrop.addEventListener('click', () => closeModal('reportModal'));
  }

  // Rating modal
  const ratingModal = document.getElementById('ratingModal');
  const closeRatingBtn = document.getElementById('closeRatingModal');
  const ratingBackdrop = ratingModal?.querySelector('.modal__backdrop');

  if (closeRatingBtn) {
    closeRatingBtn.addEventListener('click', () => closeModal('ratingModal'));
  }
  if (ratingBackdrop) {
    ratingBackdrop.addEventListener('click', () => closeModal('ratingModal'));
  }

  // Report types
  initReportTypes();

  // Star rating
  initStarRating();

  // Submit buttons
  document.getElementById('submitReportBtn')?.addEventListener('click', submitReport);
  document.getElementById('submitRatingBtn')?.addEventListener('click', submitRating);
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
  }
}

function initReportTypes() {
  const reportTypes = document.querySelectorAll('.report-type');

  reportTypes.forEach(type => {
    type.addEventListener('click', () => {
      // Update selection
      reportTypes.forEach(t => t.classList.remove('selected'));
      type.classList.add('selected');

      AppState.selectedReportType = type.dataset.type;

      // Show severity and description
      document.getElementById('reportSeverity').style.display = 'block';
      document.getElementById('reportDescription').style.display = 'block';

      // Enable submit button
      document.getElementById('submitReportBtn').disabled = false;
    });
  });
}

function initStarRating() {
  const starBtns = document.querySelectorAll('.star-btn');

  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const rating = parseInt(btn.dataset.rating);
      AppState.userRating = rating;

      // Update star display
      starBtns.forEach(star => {
        if (parseInt(star.dataset.rating) <= rating) {
          star.classList.add('active');
        } else {
          star.classList.remove('active');
        }
      });
    });

    // Hover effect
    btn.addEventListener('mouseenter', () => {
      const rating = parseInt(btn.dataset.rating);
      starBtns.forEach(star => {
        if (parseInt(star.dataset.rating) <= rating) {
          star.style.color = '#FBBF24';
        }
      });
    });

    btn.addEventListener('mouseleave', () => {
      starBtns.forEach(star => {
        if (!star.classList.contains('active')) {
          star.style.color = '';
        }
      });
    });
  });
}

function submitReport() {
  // In production, this would call the API
  console.log('Submitting report:', {
    type: AppState.selectedReportType,
    severity: document.querySelector('input[name="severity"]:checked')?.value,
    description: document.querySelector('.report-textarea')?.value
  });

  closeModal('reportModal');
  showToast('Thanks, legend! Your report is now live.');

  // Reset form
  document.querySelectorAll('.report-type').forEach(t => t.classList.remove('selected'));
  document.getElementById('reportSeverity').style.display = 'none';
  document.getElementById('reportDescription').style.display = 'none';
  document.getElementById('submitReportBtn').disabled = true;
  AppState.selectedReportType = null;
}

function submitRating() {
  // In production, this would call the API
  const selectedTags = Array.from(document.querySelectorAll('.rating-tag input:checked'))
    .map(input => input.value);

  console.log('Submitting rating:', {
    segment: AppState.selectedSegment?.id,
    rating: AppState.userRating,
    tags: selectedTags
  });

  closeModal('ratingModal');
  showToast('Rating submitted! Cheers for the feedback.');

  // Reset form
  document.querySelectorAll('.star-btn').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.rating-tag input').forEach(i => i.checked = false);
  AppState.userRating = 0;
}

// ============================================
// ROUTE OPTIONS
// ============================================
function initRouteOptions() {
  const routeOptions = document.querySelectorAll('.route-option');

  routeOptions.forEach(option => {
    option.addEventListener('click', () => {
      routeOptions.forEach(o => o.classList.remove('active'));
      option.classList.add('active');

      // In production, this would recalculate routes
      console.log('Route mode:', option.dataset.mode);
    });
  });
}

// ============================================
// FEED FILTERS
// ============================================
function initFeedFilters() {
  const filterChips = document.querySelectorAll('.feed-filters .filter-chip');

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      // In production, this would filter the feed
      console.log('Feed filter:', chip.dataset.filter);
    });
  });
}

// ============================================
// POPULATE COMMUNITY FEED
// ============================================
function populateCommunityFeed() {
  const now = new Date();
  const todayEvents = [];
  const yesterdayEvents = [];
  const weekEvents = [];

  EVENTS.forEach(event => {
    const eventDate = new Date(event.created_at);
    const diffDays = Math.floor((now - eventDate) / 86400000);

    if (diffDays === 0) {
      todayEvents.push(event);
    } else if (diffDays === 1) {
      yesterdayEvents.push(event);
    } else if (diffDays <= 7) {
      weekEvents.push(event);
    }
  });

  // Populate containers
  populateEventList('feedEventsToday', todayEvents);
  populateEventList('feedEventsYesterday', yesterdayEvents);
  populateEventList('feedEventsWeek', weekEvents);
}

function populateEventList(containerId, events) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (events.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:16px;text-align:center;">
        <p style="color:#9CA3AF;font-size:14px;">No reports</p>
      </div>
    `;
    return;
  }

  container.innerHTML = events.map(event => createEventCardHtml(event)).join('');

  // Add vote listeners
  container.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const eventId = btn.closest('.event-card').dataset.eventId;
      const voteType = btn.dataset.vote;
      handleVote(eventId, voteType, btn);
    });
  });

  container.querySelectorAll('.confirm-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.textContent = '✓ Thanks!';
      btn.disabled = true;
      showToast('Thanks for confirming!');
    });
  });
}

function createEventCardHtml(event) {
  const icon = getEventIcon(event.event_type);
  const title = getEventTitle(event);
  const time = formatRelativeTime(event.created_at);

  let badgeHtml = '';
  if (event.severity === 'high') {
    badgeHtml = '<span class="event-card__badge event-card__badge--high">HIGH</span>';
  } else if (event.status === 'verified') {
    badgeHtml = '<span class="event-card__badge event-card__badge--verified">VERIFIED</span>';
  } else if (event.status === 'open') {
    badgeHtml = '<span class="event-card__badge event-card__badge--open">OPEN</span>';
  }

  return `
    <div class="event-card" data-event-id="${event.id}">
      <div class="event-card__header">
        <div class="event-card__icon event-card__icon--${event.event_type}">${icon}</div>
        <div class="event-card__content">
          <h4 class="event-card__title">${title}</h4>
          <p class="event-card__meta">${event.local_area} • ${time}</p>
        </div>
        ${badgeHtml}
      </div>
      <p class="event-card__description">"${event.description}"</p>
      <div class="event-card__footer">
        <div class="event-card__votes">
          <button class="vote-btn" data-vote="up">👍 ${event.upvotes}</button>
          <button class="vote-btn" data-vote="down">👎 ${event.downvotes}</button>
        </div>
        ${event.status === 'open' ? '<button class="confirm-btn">Confirm ✓</button>' : ''}
      </div>
    </div>
  `;
}

function handleVote(eventId, voteType, btn) {
  // In production, this would call the API
  console.log('Vote:', eventId, voteType);

  btn.classList.add('active');
  const currentCount = parseInt(btn.textContent.match(/\d+/)[0]);
  btn.innerHTML = `${voteType === 'up' ? '👍' : '👎'} ${currentCount + 1}`;
}

// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
  // Quick Note FAB
  document.getElementById('quickNoteBtn')?.addEventListener('click', () => {
    openModal('reportModal');
  });

  // Report button in feed
  document.getElementById('reportBtn')?.addEventListener('click', () => {
    openModal('reportModal');
  });

  // Rate segment button
  document.getElementById('rateSegmentBtn')?.addEventListener('click', () => {
    if (AppState.selectedSegment) {
      document.getElementById('ratingSegmentName').textContent = AppState.selectedSegment.road_name;
      openModal('ratingModal');
    }
  });

  // Start route button
  document.getElementById('startRouteBtn')?.addEventListener('click', () => {
    showToast('Starting navigation...');
  });

  // Filter button
  document.getElementById('filterBtn')?.addEventListener('click', () => {
    showToast('Filter options coming soon!');
  });

  // Menu button
  document.getElementById('menuBtn')?.addEventListener('click', () => {
    showToast('Menu coming soon!');
  });
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  if (toast && toastMessage) {
    toastMessage.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => {
      toast.classList.remove('visible');
    }, 3000);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// KEYBOARD SHORTCUTS (for development)
// ============================================
document.addEventListener('keydown', (e) => {
  // Press 'D' to log current state
  if (e.key === 'd' && e.ctrlKey) {
    console.log('App State:', AppState);
    console.log('Segments:', SEGMENTS);
    console.log('Events:', EVENTS);
    console.log('POIs:', POIS);
  }
});
