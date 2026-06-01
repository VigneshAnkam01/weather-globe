/**
 * globe.js — Interactive 3D Earth globe using globe.gl
 */

import Globe from 'globe.gl';

/**
 * Initialize the interactive 3D globe.
 *
 * @param {HTMLElement} container - DOM element to render the globe into
 * @param {Object} callbacks
 * @param {Function} callbacks.onClick - Called with (lat, lng) when globe is clicked
 * @returns {Object} The globe instance
 */
export function initGlobe(container, { onClick }) {
  // Create the globe instance
  const globe = Globe()(container);

  // Initialize properties on globe for encapsulation
  globe.allCountries = [];
  globe.selectedCountryCode = '';
  globe.currentStateBoundary = null;
  globe.currentCityBoundary = null;

  // Apply default textures & appearance
  globe
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
    .showAtmosphere(true)
    .atmosphereColor('#3b82f6')
    .atmosphereAltitude(0.2)
    .showGraticules(false)
    .width(container.clientWidth)
    .height(container.clientHeight);

  // Configure points layer (for current clicked marker)
  globe
    .pointsData([])
    .pointColor('color')
    .pointAltitude('size')
    .pointRadius('radius')
    .pointsMerge(false);

  // Configure rings layer (for active click pulse ripple)
  globe
    .ringsData([])
    .ringColor(() => '#3b82f680')
    .ringMaxRadius('maxR')
    .ringPropagationSpeed('propagationSpeed')
    .ringRepeatPeriod('repeatPeriod');

  // Configure custom layered polygons (Country, State, City boundaries)
  // Utilizes highly defensive checks to prevent runtime errors from unformatted GeoJSON datasets
  globe
    .polygonCapColor((d) => {
      if (d && d.properties) {
        if (d.properties.type === 'city') return 'rgba(6, 182, 212, 0.16)';
        if (d.properties.type === 'state') return 'rgba(139, 92, 246, 0.12)';
        const isSelected = typeof d.properties.ISO_A2 === 'string' &&
          d.properties.ISO_A2.toLowerCase() === globe.selectedCountryCode;
        return isSelected ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 255, 0.01)';
      }
      return 'rgba(255, 255, 255, 0.01)';
    })
    .polygonStrokeColor((d) => {
      if (d && d.properties) {
        if (d.properties.type === 'city') return '#06b6d4';
        if (d.properties.type === 'state') return '#8b5cf6';
        const isSelected = typeof d.properties.ISO_A2 === 'string' &&
          d.properties.ISO_A2.toLowerCase() === globe.selectedCountryCode;
        return isSelected ? '#3b82f6' : 'rgba(255, 255, 255, 0.12)';
      }
      return 'rgba(255, 255, 255, 0.12)';
    })
    .polygonStrokeWidth((d) => {
      if (d && d.properties) {
        if (d.properties.type === 'city') return 1.8;
        if (d.properties.type === 'state') return 1.4;
        const isSelected = typeof d.properties.ISO_A2 === 'string' &&
          d.properties.ISO_A2.toLowerCase() === globe.selectedCountryCode;
        return isSelected ? 1.0 : 0.4;
      }
      return 0.4;
    })
    .polygonAltitude((d) => {
      if (d && d.properties) {
        if (d.properties.type === 'city') return 0.014;
        if (d.properties.type === 'state') return 0.008;
        const isSelected = typeof d.properties.ISO_A2 === 'string' &&
          d.properties.ISO_A2.toLowerCase() === globe.selectedCountryCode;
        return isSelected ? 0.003 : 0.0005;
      }
      return 0.0005;
    })
    .polygonSideColor(() => 'rgba(0, 0, 0, 0)');

  // Load global country borders on boot
  fetch('https://unpkg.com/three-globe/example/img/ne_110m_admin_0_countries.geojson')
    .then((res) => res.json())
    .then((countries) => {
      if (countries && countries.features) {
        globe.allCountries = countries.features;
        updatePolygons(globe);
      }
    })
    .catch((err) => console.warn('Could not load global country borders:', err));

  // Set initial camera position
  globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0);

  // Enable auto-rotate
  try {
    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
    }
  } catch (e) {
    console.warn('Could not configure orbit controls:', e);
  }

  // Click handler
  globe.onGlobeClick(({ lat, lng }) => {
    // Stop auto-rotation on first click
    try {
      const controls = globe.controls();
      if (controls) controls.autoRotate = false;
    } catch {}
    onClick(lat, lng);
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    globe.width(container.clientWidth);
    globe.height(container.clientHeight);
  });

  return globe;
}

/**
 * Update the polygon dataset of the globe.
 */
function updatePolygons(globe) {
  const data = [...globe.allCountries];
  if (globe.currentStateBoundary) data.push(globe.currentStateBoundary);
  if (globe.currentCityBoundary) data.push(globe.currentCityBoundary);
  globe.polygonsData(data);
}

/**
 * Smoothly fly the camera to a lat/lng position.
 */
export function flyTo(globe, lat, lng, altitude = 1.8) {
  globe.pointOfView({ lat, lng, altitude }, 1000);
}

/**
 * Place a glowing marker point at the given coordinates.
 */
export function setMarker(globe, lat, lng, color = '#3b82f6') {
  globe.pointsData([
    { lat, lng, size: 0.15, color, radius: 0.45 },
  ]);
}

/**
 * Add an animated expanding ring at the given coordinates.
 */
export function addRing(globe, lat, lng, color = '#3b82f680') {
  globe.ringsData([
    {
      lat,
      lng,
      maxR: 4,
      propagationSpeed: 3,
      repeatPeriod: 1200,
      color,
    },
  ]);
}

/**
 * Highlight a specific country border on the globe.
 */
export function setSelectedCountry(globe, countryCode) {
  globe.selectedCountryCode = countryCode ? countryCode.toLowerCase() : '';
  updatePolygons(globe);
}

/**
 * Add dynamic state and city GeoJSON boundaries to the globe.
 */
export function setLocalBoundaries(globe, stateBoundary, cityBoundary) {
  globe.currentStateBoundary = stateBoundary;
  globe.currentCityBoundary = cityBoundary;
  updatePolygons(globe);
}

/**
 * Clear all custom active boundaries.
 */
export function clearBoundaries(globe) {
  globe.selectedCountryCode = '';
  globe.currentStateBoundary = null;
  globe.currentCityBoundary = null;
  updatePolygons(globe);
}

/**
 * Swap globe texture and theme dynamically based on timezone time of day.
 *
 * @param {Object} globe
 * @param {boolean} isDay - True for Day theme, false for Night theme
 */
export function updateGlobeTheme(globe, isDay) {
  if (isDay) {
    globe
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .atmosphereColor('#3b82f6')
      .atmosphereAltitude(0.2);
  } else {
    globe
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night-lights.jpg')
      .atmosphereColor('#1e3a8a')
      .atmosphereAltitude(0.18);
  }
}

/**
 * Plot custom weather pins placed by the community on the globe.
 */
export function setCommunityPins(globe, pins) {
  if (!pins) return;
  const pinPoints = pins.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    size: 0.1,
    color: '#f59e0b',
    radius: 0.3,
    name: `${p.username}: "${p.message}" (${p.temp})`,
  }));
  globe.pointsData(pinPoints);
}

/**
 * Clear all markers and rings from the globe.
 */
export function clearMarkers(globe) {
  globe.pointsData([]);
  globe.ringsData([]);
}
