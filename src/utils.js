/**
 * utils.js — Utility functions, formatting, localStorage helpers
 */

/**
 * Format temperature with unit symbol.
 * Input is always Celsius; converts to Fahrenheit if unit === 'F'.
 */
export function formatTemp(temp, unit = null) {
  const u = unit || getUnit();
  if (u === 'F') {
    return `${Math.round(celsiusToFahrenheit(temp))}°F`;
  }
  return `${Math.round(temp)}°C`;
}

/** Convert Celsius to Fahrenheit */
export function celsiusToFahrenheit(c) {
  return (c * 9) / 5 + 32;
}

/** Convert wind direction degrees to compass label */
export function getWindDirection(degrees) {
  if (degrees == null) return '—';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return dirs[index];
}

/** Standard debounce */
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/** Format ISO date string to short day name (e.g. "Mon") */
export function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/** Format ISO date string to "Mon, Jan 15" */
export function formatFullDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Returns CSS class based on temperature (Celsius) */
export function getTemperatureClass(temp) {
  if (temp < 10) return 'cool';
  if (temp > 30) return 'warm';
  return 'neutral';
}

/** Round coordinate to 2 decimal places */
export function roundCoord(coord) {
  return Math.round(coord * 100) / 100;
}

/* ---------- localStorage Cache Helpers ---------- */

/**
 * Get cached data by key. Returns null if expired or missing.
 * Cached items have shape: { data, expires_at }
 */
export function getFromCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (!cached.expires_at || Date.now() > cached.expires_at) {
      localStorage.removeItem(key);
      return null;
    }
    return cached.data;
  } catch {
    return null;
  }
}

/**
 * Store data in localStorage with a TTL (in minutes).
 */
export function setToCache(key, data, ttlMinutes = 30) {
  try {
    const item = {
      data,
      expires_at: Date.now() + ttlMinutes * 60 * 1000,
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch {
    // Storage full — silently fail
  }
}

/* ---------- Search History Helpers ---------- */

const HISTORY_KEY = 'weather_history';
const MAX_HISTORY = 20;

/** Get search history array */
export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Add an entry to the top of history (max 20 items) */
export function addToHistory(entry) {
  try {
    const history = getHistory();
    // Avoid duplicates (same coords)
    const filtered = history.filter(
      (h) => !(Math.abs(h.lat - entry.lat) < 0.05 && Math.abs(h.lng - entry.lng) < 0.05)
    );
    filtered.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, MAX_HISTORY)));
  } catch {
    // Silently fail
  }
}

/** Clear all search history */
export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

/* ---------- Unit Preference ---------- */

const UNIT_KEY = 'temp_unit';

/** Get saved temperature unit ('C' or 'F') */
export function getUnit() {
  return localStorage.getItem(UNIT_KEY) || 'C';
}

/** Save temperature unit */
export function setUnit(unit) {
  localStorage.setItem(UNIT_KEY, unit);
}
