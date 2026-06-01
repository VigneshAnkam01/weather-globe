/**
 * geocoding.js — Reverse geocoding (coords → place name), forward search, and boundary polygon fetching
 */

/**
 * Reverse geocode coordinates to a location name.
 * Tries BigDataCloud (client-side, free) first, falls back to Nominatim.
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<{city: string, state: string, country: string, displayName: string, countryCode: string}>}
 */
export async function reverseGeocode(lat, lng) {
  // Try BigDataCloud first (client-side, no API key)
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.locality || data.city || data.principalSubdivision || '';
      const state = data.principalSubdivision || '';
      const country = data.countryName || '';
      const countryCode = data.countryCode ? data.countryCode.toLowerCase() : '';
      const displayName = buildDisplayName(city, state, country);
      if (displayName) {
        return { city, state, country, displayName, countryCode };
      }
    }
  } catch {
    // Fall through to Nominatim
  }

  // Fallback: Nominatim (OpenStreetMap)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.county || '';
      const state = addr.state || '';
      const country = addr.country || '';
      const countryCode = addr.country_code ? addr.country_code.toLowerCase() : '';
      const displayName = buildDisplayName(city, state, country);
      return { city, state, country, displayName, countryCode };
    }
  } catch {
    // Fall through to fallback
  }

  // Ultimate fallback — show coordinates
  return {
    city: 'Unknown Location',
    state: '',
    country: '',
    displayName: `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
    countryCode: '',
  };
}

/**
 * Fetch GeoJSON boundaries for State and City/Town of clicked coordinates from Nominatim.
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<{stateBoundary: Object|null, cityBoundary: Object|null}>}
 */
export async function fetchBoundaryPolygons(lat, lng) {
  const result = { stateBoundary: null, cityBoundary: null };

  // Helper to fetch and build standard GeoJSON Feature from Nominatim reverse query
  async function fetchBoundary(zoom, type) {
    try {
      // Delay slightly between requests to respect Nominatim rate limits
      await new Promise(resolve => setTimeout(resolve, zoom === 5 ? 200 : 0));

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&polygon_geojson=1&zoom=${zoom}`
      );

      if (!res.ok) return null;

      const data = await res.json();
      if (!data.geojson || (data.geojson.type !== 'Polygon' && data.geojson.type !== 'MultiPolygon')) {
        return null;
      }

      const addr = data.address || {};
      const name = type === 'city'
        ? (addr.city || addr.town || addr.village || addr.municipality || 'Local Boundary')
        : (addr.state || addr.province || addr.region || 'State Boundary');

      return {
        type: 'Feature',
        properties: {
          type,
          name,
          displayName: data.display_name,
        },
        geometry: data.geojson,
      };
    } catch (e) {
      console.warn(`Failed to fetch ${type} boundary boundary:`, e);
      return null;
    }
  }

  try {
    // Fetch state (zoom 5) and city (zoom 10) boundaries in parallel with rate limit safety
    const [cityBoundary, stateBoundary] = await Promise.all([
      fetchBoundary(10, 'city'),
      fetchBoundary(5, 'state'),
    ]);

    result.cityBoundary = cityBoundary;
    result.stateBoundary = stateBoundary;
  } catch (error) {
    console.warn('Failed to fetch boundary polygons:', error);
  }

  return result;
}

/**
 * Search for locations by name using Open-Meteo Geocoding.
 *
 * @param {string} query - Search query
 * @returns {Promise<Array<{name: string, lat: number, lng: number, country: string, state: string, countryCode: string}>>}
 */
export async function searchLocations(query) {
  if (!query || query.length < 2) return [];

  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en`
    );
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.results || !data.results.length) return [];

    return data.results.map((r) => ({
      name: r.name,
      lat: r.latitude,
      lng: r.longitude,
      country: r.country || '',
      state: r.admin1 || '',
      countryCode: r.country_code || '',
    }));
  } catch {
    return [];
  }
}

/* ---------- Internal Helpers ---------- */

function buildDisplayName(city, state, country) {
  const parts = [];
  if (city) parts.push(city);
  // Only add state if it differs from city
  if (state && state !== city) parts.push(state);
  if (country) parts.push(country);
  return parts.join(', ');
}
