/**
 * main.js — Application entry point and orchestrator
 * Wires together the 3D globe, weather API, geocoding boundaries, shared backend, and UI modules.
 */

import {
  initGlobe,
  flyTo,
  setMarker,
  addRing,
  clearMarkers,
  setSelectedCountry,
  setLocalBoundaries,
  clearBoundaries,
  updateGlobeTheme,
  setCommunityPins,
} from './globe.js';
import { fetchWeather } from './weather.js';
import { reverseGeocode, fetchBoundaryPolygons } from './geocoding.js';
import { initSearch } from './search.js';
import { getWeatherDescription } from './icons.js';
import {
  showWeatherCard,
  hideWeatherCard,
  showLoading,
  showError,
  updateCoordsDisplay,
  hideLoadingScreen,
  renderSidebar,
  updateAppTheme,
} from './ui.js';
import {
  addToHistory,
  getHistory,
  clearHistory,
  getUnit,
  setUnit,
  roundCoord,
} from './utils.js';

/* ---------- Constants ---------- */
// Auto-detect production backend vs local development backend
const BACKEND_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://weatherglobe-backend.onrender.com'; // Deployed 24/7 backend API URL

/* ---------- Application State ---------- */
let globe = null;
let currentWeatherData = null;
let currentLocationData = null;
let currentLat = null;
let currentLng = null;
let isLoading = false;
let sidebarTab = 'recent'; // 'recent' or 'global'
let globalHistory = [];
let globalPins = [];

/* ---------- Boot ---------- */
async function boot() {
  try {
    // 1. Initialize the 3D globe
    const container = document.getElementById('globe-container');
    if (container) {
      globe = initGlobe(container, {
        onClick: handleGlobeClick,
      });
    } else {
      console.error('Globe container not found');
    }

    // 2. Initialize search with autocomplete
    initSearch(handleLocationSelect);

    // 3. Load initial database records & update UI/Globe
    loadSharedDatabase();

    // 4. Set up unit toggle (°C / °F)
    const unitToggle = document.getElementById('unit-toggle');
    if (unitToggle) {
      unitToggle.textContent = `°${getUnit()}`;
      unitToggle.addEventListener('click', () => {
        const newUnit = getUnit() === 'C' ? 'F' : 'C';
        setUnit(newUnit);
        unitToggle.textContent = `°${newUnit}`;
        // Re-render current weather with new unit if visible
        if (currentWeatherData && currentLocationData) {
          showWeatherCard(currentWeatherData, currentLocationData);
          attachWeatherCardListeners();
        }
      });
    }

    // 5. Close weather panel button
    const closeBtn = document.getElementById('close-weather');
    if (closeBtn) {
      closeBtn.addEventListener('click', hideWeatherCard);
    }

    // 6. Set up drop a weather pin modal listeners
    setUpPinModalListeners();
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }

  // 7. Dismiss loading screen
  setTimeout(() => hideLoadingScreen(), 1500);
}

// Boot immediately or on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

/* ---------- Shared Database Connectors ---------- */

/**
 * Load global shared database history and community pins from the server
 */
async function loadSharedDatabase() {
  try {
    // Fetch global history and pins in parallel
    const [historyRes, pinsRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/history`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${BACKEND_URL}/api/pins`).then((r) => (r.ok ? r.json() : [])),
    ]).catch(() => [[], []]);

    globalHistory = historyRes;
    globalPins = pinsRes;

    // Render loaded community report pins directly on the 3D globe!
    if (globe && globalPins.length > 0) {
      setCommunityPins(globe, globalPins);
    }
  } catch (e) {
    console.warn('Backend server database is currently offline. Operating in standalone mode.');
  } finally {
    // Initial sidebar render
    refreshSidebar();
  }
}

/**
 * Record a weather search globally in the shared database
 */
async function postSharedSearch(lat, lng, city, temp, condition) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, city, temp, condition }),
    });
    if (res.ok) {
      const entry = await res.json();
      globalHistory.unshift(entry);
      if (globalHistory.length > 15) globalHistory.pop();
    }
  } catch {
    // Fail silently in case backend is asleep
  }
}

/* ---------- Event Handlers ---------- */

/**
 * Handle a click on the globe surface.
 * Fetches weather, geocoding, boundary outlines, and displays cards.
 */
async function handleGlobeClick(lat, lng) {
  if (isLoading) return;

  currentLat = roundCoord(lat);
  currentLng = roundCoord(lng);
  isLoading = true;

  // Show loading skeleton
  showLoading();

  // Fly camera to clicked coordinates
  if (globe) {
    flyTo(globe, currentLat, currentLng);
    clearMarkers(globe);
    setMarker(globe, currentLat, currentLng);
    addRing(globe, currentLat, currentLng);
  }

  try {
    // Fetch Weather, Reverse geocoding details, AND local boundary GeoJSONs in parallel!
    // We add individual catches to reverseGeocode and fetchBoundaryPolygons so they NEVER reject the Promise.all!
    const [weather, location, boundaries] = await Promise.all([
      fetchWeather(currentLat, currentLng),
      reverseGeocode(currentLat, currentLng).catch((err) => {
        console.warn('Reverse geocode failed:', err);
        return {
          city: 'Unknown Location',
          state: '',
          country: '',
          displayName: `${currentLat.toFixed(2)}°, ${currentLng.toFixed(2)}°`,
          countryCode: '',
        };
      }),
      fetchBoundaryPolygons(currentLat, currentLng).catch((err) => {
        console.warn('Boundary polygons fetch failed:', err);
        return { stateBoundary: null, cityBoundary: null };
      }),
    ]);

    currentWeatherData = weather;
    
    // Defensive safeguard checks
    const safeLocation = location || {
      city: 'Unknown Location',
      state: '',
      country: '',
      displayName: `${currentLat.toFixed(2)}°, ${currentLng.toFixed(2)}°`,
      countryCode: '',
    };
    safeLocation.lat = currentLat;
    safeLocation.lng = currentLng;
    currentLocationData = safeLocation;

    // 1. Render boundary polygons dynamically on the globe!
    if (globe) {
      // Clear old borders
      clearBoundaries(globe);
      
      // Set country border highlight
      if (safeLocation.countryCode) {
        setSelectedCountry(globe, safeLocation.countryCode);
      }
      
      // Set local state and city boundary outlines
      const stateBoundary = boundaries ? boundaries.stateBoundary : null;
      const cityBoundary = boundaries ? boundaries.cityBoundary : null;
      setLocalBoundaries(globe, stateBoundary, cityBoundary);
      
      // Update globe day/night texture and atmosphere colors based on local timezone time of day
      const isDay = weather && weather.current && weather.current.isDay;
      updateGlobeTheme(globe, isDay);
    }

    // 2. Render weather info details card
    showWeatherCard(weather, safeLocation);
    attachWeatherCardListeners();

    // 3. Add to local localStorage history
    const tempText = `${Math.round(weather.current.temperature)}°`;
    const conditionText = getWeatherDescription(weather.current.weatherCode);

    addToHistory({
      lat: currentLat,
      lng: currentLng,
      city: location.city || location.displayName,
      temp: tempText,
      condition: conditionText,
    });

    // 4. Save to global shared database history
    postSharedSearch(currentLat, currentLng, location.city || location.displayName, tempText, conditionText);

    refreshSidebar();
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    showError('Failed to fetch weather data. Please try again.');
  } finally {
    isLoading = false;
  }
}

/**
 * Handle location selected from the search autocomplete.
 */
function handleLocationSelect(lat, lng, _name) {
  handleGlobeClick(lat, lng);
}

/**
 * Refresh and render the sidebar elements
 */
function refreshSidebar() {
  const localHistory = getHistory();
  renderSidebar(localHistory, globalPins, sidebarTab, (newTab) => {
    sidebarTab = newTab;
    refreshSidebar();
  });

  // Attach event controllers to sidebar elements
  const panel = document.getElementById('history-panel');
  if (panel) {
    // Local history clicks
    panel.querySelectorAll('.history-item').forEach((item) => {
      item.addEventListener('click', () => {
        const lat = parseFloat(item.dataset.lat);
        const lng = parseFloat(item.dataset.lng);
        handleGlobeClick(lat, lng);
      });
    });

    // Global community pin clicks
    panel.querySelectorAll('.board-pin-item').forEach((item) => {
      item.addEventListener('click', () => {
        const lat = parseFloat(item.dataset.lat);
        const lng = parseFloat(item.dataset.lng);
        handleGlobeClick(lat, lng);
      });
    });

    // Local clear history button
    const clearBtn = panel.querySelector('#clear-history');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearHistory();
        refreshSidebar();
      });
    }
  }
}

/**
 * Wire listeners to the weather card panel
 */
function attachWeatherCardListeners() {
  const btn = document.getElementById('btn-trigger-pin');
  if (btn) {
    btn.addEventListener('click', () => {
      const modal = document.getElementById('pin-modal-overlay');
      if (modal) modal.classList.add('visible');
    });
  }
}

/**
 * Setup Drop Weather Pin Modal Actions
 */
function setUpPinModalListeners() {
  const modal = document.getElementById('pin-modal-overlay');
  const cancelBtn = document.getElementById('pin-cancel');
  const submitBtn = document.getElementById('pin-submit');

  if (!modal) return;

  // Close modal helper
  const closeModal = () => {
    modal.classList.remove('visible');
    const inputUser = document.getElementById('pin-username');
    const inputMsg = document.getElementById('pin-message');
    if (inputUser) inputUser.value = '';
    if (inputMsg) inputMsg.value = '';
  };

  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Close on outer overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      const usernameInput = document.getElementById('pin-username');
      const messageInput = document.getElementById('pin-message');

      const username = usernameInput ? usernameInput.value.trim() : 'Anonymous Explorer';
      const message = messageInput ? messageInput.value.trim() : 'Checking weather here!';

      if (!message) {
        showError('Please type a message report first!');
        return;
      }

      if (currentLat === null || currentLng === null) {
        showError('No coordinate active. Click the globe first!');
        return;
      }

      submitBtn.textContent = 'Dropping...';
      submitBtn.disabled = true;

      try {
        const tempText = `${Math.round(currentWeatherData.current.temperature)}°${getUnit()}`;
        const conditionText = getWeatherDescription(currentWeatherData.current.weatherCode);

        // POST request to backend API to register new public pin
        const response = await fetch(`${BACKEND_URL}/api/pins`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: currentLat,
            lng: currentLng,
            username,
            message,
            temp: tempText,
            condition: conditionText,
          }),
        });

        if (response.ok) {
          const newPin = await response.json();
          globalPins.unshift(newPin);

          // Update markers on globe
          if (globe) {
            setCommunityPins(globe, globalPins);
          }

          closeModal();
          showError('✨ Weather Pin dropped successfully! Visible to everyone.');

          // Switch tab to Global Pins to see their pin immediately!
          sidebarTab = 'global';
          refreshSidebar();
        } else {
          showError('Could not drop pin. Server reported an error.');
        }
      } catch (err) {
        console.error(err);
        showError('Database is currently offline. Standalone mode cannot sync pins.');
      } finally {
        submitBtn.textContent = 'Drop Pin';
        submitBtn.disabled = false;
      }
    });
  }
}
