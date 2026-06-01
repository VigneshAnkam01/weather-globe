/**
 * ui.js — UI rendering for weather cards, history, loading states, and notifications
 */

import { getWeatherIcon, getWeatherDescription } from './icons.js';
import { formatTemp, formatDate, getWindDirection, getTemperatureClass, getUnit } from './utils.js';

/* ---------- DOM References ---------- */
const weatherPanel = () => document.getElementById('weather-panel');
const weatherContent = () => document.getElementById('weather-content');
const historyPanel = () => document.getElementById('history-panel');
const coordsDisplay = () => document.getElementById('coords-display');
const errorToast = () => document.getElementById('error-toast');
const loadingScreen = () => document.getElementById('loading-screen');

/**
 * Update the overall theme of the application (Body classes and celestial background visibility)
 *
 * @param {boolean} isDay - True for Day, false for Night
 */
export function updateAppTheme(isDay) {
  if (isDay) {
    document.body.classList.remove('theme-night');
    document.body.classList.add('theme-day');
  } else {
    document.body.classList.remove('theme-day');
    document.body.classList.add('theme-night');
  }
}

/**
 * Render the full weather card and slide the panel in.
 */
export function showWeatherCard(weatherData, locationData) {
  const content = weatherContent();
  const panel = weatherPanel();
  if (!content || !panel) return;

  const unit = getUnit();
  const c = weatherData.current;
  const tempClass = getTemperatureClass(c.temperature);
  const windDir = getWindDirection(c.windDirection);

  // Set the theme according to local time of day
  updateAppTheme(c.isDay);

  // Safe coordinates fallback for Google Maps embed
  const mapLat = locationData && typeof locationData.lat === 'number' ? locationData.lat : 0;
  const mapLng = locationData && typeof locationData.lng === 'number' ? locationData.lng : 0;

  // Build weather card HTML with a floating celestial theme context and "Drop a Pin" button
  content.innerHTML = `
    <div class="weather-location fade-in">
      <h2>${escapeHtml(locationData.city || locationData.displayName)}</h2>
      <div class="location-subtitle">
        ${escapeHtml(buildSubtitle(locationData))}
      </div>
    </div>

    <div class="weather-hero fade-in fade-in-delay-1">
      <div class="weather-main">
        <div class="weather-temp ${tempClass}">${formatTemp(c.temperature, unit)}</div>
        <div class="weather-feels-like">Feels like ${formatTemp(c.feelsLike, unit)}</div>
      </div>
      <div class="weather-condition">
        <div class="condition-icon">${getWeatherIcon(c.weatherCode, 64)}</div>
        <div class="condition-text">${getWeatherDescription(c.weatherCode)}</div>
      </div>
    </div>

    <div class="weather-details fade-in fade-in-delay-2">
      <div class="detail-card">
        <div class="detail-label"><span>💨</span> Wind</div>
        <div class="detail-value">${Math.round(c.windSpeed)}<span class="detail-unit"> km/h ${windDir}</span></div>
      </div>
      <div class="detail-card">
        <div class="detail-label"><span>💧</span> Humidity</div>
        <div class="detail-value">${c.humidity}<span class="detail-unit">%</span></div>
      </div>
      <div class="detail-card">
        <div class="detail-label"><span>🌧️</span> Precipitation</div>
        <div class="detail-value">${c.precipitation}<span class="detail-unit"> mm</span></div>
      </div>
      <div class="detail-card">
        <div class="detail-label"><span>☁️</span> Cloud Cover</div>
        <div class="detail-value">${c.cloudCover}<span class="detail-unit">%</span></div>
      </div>
      <div class="detail-card">
        <div class="detail-label"><span>📊</span> Pressure</div>
        <div class="detail-value">${Math.round(c.pressure)}<span class="detail-unit"> hPa</span></div>
      </div>
      <div class="detail-card">
        <div class="detail-label"><span>🧭</span> Timezone</div>
        <div class="detail-value" style="font-size: 13px; font-weight: 500;">${(weatherData.timezone || 'auto').replace('_', ' ')}</div>
      </div>
    </div>

    <div class="forecast-section fade-in fade-in-delay-3">
      <h3>7-Day Forecast</h3>
      <div class="forecast-grid">
        ${weatherData.daily
          .map(
            (day, i) => `
          <div class="forecast-day">
            <div class="day-name">${i === 0 ? 'Today' : formatDate(day.date)}</div>
            <div class="day-icon">${getWeatherIcon(day.weatherCode, 28)}</div>
            <div class="day-temp-high">${formatTemp(day.tempMax, unit)}</div>
            <div class="day-temp-low">${formatTemp(day.tempMin, unit)}</div>
          </div>`
          )
          .join('')}
      </div>
    </div>

    <!-- Local Interactive Google Map (Google Earth Satellite Hybrid) -->
    <div class="forecast-section fade-in fade-in-delay-3" style="margin-top: 22px;">
      <h3>📍 Local Street Map (Google Earth Mode)</h3>
      <div class="map-embed-container">
        <iframe 
          src="https://maps.google.com/maps?q=${mapLat},${mapLng}&t=h&z=12&ie=UTF8&iwloc=&output=embed" 
          allowfullscreen>
        </iframe>
      </div>
    </div>

    <!-- Drop a Weather Pin Button (Collaborative DB feature!) -->
    <button id="btn-trigger-pin" class="drop-pin-btn fade-in fade-in-delay-4">
      <span>📌</span> Drop a Weather Pin Here
    </button>
  `;

  // Show the panel
  panel.classList.add('visible');
}

/**
 * Hide the weather panel with a slide-out animation.
 */
export function hideWeatherCard() {
  const panel = weatherPanel();
  if (panel) panel.classList.remove('visible');
}

/**
 * Show skeleton loading placeholders in the weather panel.
 */
export function showLoading() {
  const content = weatherContent();
  const panel = weatherPanel();
  if (!content || !panel) return;

  content.innerHTML = `
    <div style="padding-right: 40px;">
      <div class="skeleton" style="height: 24px; width: 65%; margin-bottom: 8px;"></div>
      <div class="skeleton" style="height: 14px; width: 40%; margin-bottom: 24px;"></div>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 20px 0; margin-bottom: 20px; border-bottom: 1px solid var(--border-glass);">
      <div>
        <div class="skeleton" style="height: 56px; width: 120px; margin-bottom: 8px;"></div>
        <div class="skeleton" style="height: 14px; width: 90px;"></div>
      </div>
      <div class="skeleton" style="height: 64px; width: 64px; border-radius: 12px;"></div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
      ${Array(6).fill('<div class="skeleton" style="height: 70px; border-radius: 12px;"></div>').join('')}
    </div>
    <div class="skeleton" style="height: 14px; width: 50%; margin-bottom: 16px;"></div>
    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;">
      ${Array(7).fill('<div class="skeleton" style="height: 100px; border-radius: 12px;"></div>').join('')}
    </div>
  `;

  panel.classList.add('visible');
}

/**
 * Render the unified Sidebar with Local History and Global Community Pins.
 *
 * @param {Array} historyItems
 * @param {Array} globalPins
 * @param {string} activeTab - 'recent' or 'global'
 * @param {Function} onTabChange - Callback when user switches tab
 */
export function renderSidebar(historyItems, globalPins = [], activeTab = 'recent', onTabChange) {
  const panel = historyPanel();
  if (!panel) return;

  panel.innerHTML = `
    <div class="board-tabs">
      <button class="board-tab ${activeTab === 'recent' ? 'active' : ''}" id="tab-recent">Recent</button>
      <button class="board-tab ${activeTab === 'global' ? 'active' : ''}" id="tab-global">Global Pins</button>
    </div>
    
    ${activeTab === 'recent' ? `
      <div class="history-header" style="margin-top: 8px;">
        <h3>🕒 Local History</h3>
        <button id="clear-history">Clear</button>
      </div>
      <div id="history-list" class="history-list">
        ${historyItems.length === 0 ? `
          <div style="text-align: center; padding: 24px 0; color: var(--text-tertiary); font-size: 13px; line-height: 1.5;">
            Click anywhere on the globe<br/>to start exploring weather
          </div>
        ` : historyItems.map(item => `
          <div class="history-item" data-lat="${item.lat}" data-lng="${item.lng}">
            <div class="history-city">${escapeHtml(item.city)}</div>
            <div class="history-detail">
              <span class="history-temp">${item.temp}</span>
              <span>${escapeHtml(item.condition)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    ` : `
      <div class="history-header" style="margin-top: 8px;">
        <h3>🌍 Community Reports</h3>
      </div>
      <div id="global-pins-list" class="history-list">
        ${globalPins.length === 0 ? `
          <div style="text-align: center; padding: 24px 0; color: var(--text-tertiary); font-size: 13px; line-height: 1.5;">
            No global pins yet.<br/>Click anywhere to drop one!
          </div>
        ` : globalPins.map(pin => `
          <div class="board-pin-item" data-lat="${pin.lat}" data-lng="${pin.lng}">
            <div class="board-pin-header">
              <span class="board-pin-user">👤 ${escapeHtml(pin.username)}</span>
              <span class="board-pin-time">${formatTimeAgo(pin.timestamp)}</span>
            </div>
            <div class="board-pin-message">"${escapeHtml(pin.message)}"</div>
            <div class="board-pin-meta">
              <span class="board-pin-temp">${pin.temp}</span>
              <span>${escapeHtml(pin.condition)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;

  // Attach tab controllers
  const tabRecent = panel.querySelector('#tab-recent');
  const tabGlobal = panel.querySelector('#tab-global');
  if (tabRecent) tabRecent.addEventListener('click', () => onTabChange('recent'));
  if (tabGlobal) tabGlobal.addEventListener('click', () => onTabChange('global'));

  // Keep sidebar visible if we have lists
  panel.classList.add('visible');
}

/**
 * Hide the history sidebar panel.
 */
export function hideHistory() {
  const panel = historyPanel();
  if (panel) panel.classList.remove('visible');
}

/**
 * Show an error toast notification.
 */
export function showError(message) {
  const toast = errorToast();
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('visible');

  setTimeout(() => {
    toast.classList.remove('visible');
  }, 4000);
}

/**
 * Update the coordinate display in the bottom-right corner.
 */
export function updateCoordsDisplay(lat, lng) {
  const display = coordsDisplay();
  if (!display) return;

  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  display.textContent = `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lng).toFixed(2)}°${lngDir}`;
  display.classList.add('visible');
}

/**
 * Hide the loading screen with a fade-out transition.
 */
export function hideLoadingScreen() {
  const screen = loadingScreen();
  if (!screen) return;

  screen.classList.add('loaded');
  setTimeout(() => {
    screen.remove();
  }, 700);
}

/* ---------- Internal Helpers ---------- */

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function buildSubtitle(location) {
  const parts = [];
  if (location.state && location.state !== location.city) parts.push(location.state);
  if (location.country) parts.push(location.country);
  return parts.join(', ');
}

function formatTimeAgo(isoString) {
  try {
    const date = new Date(isoString);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'recently';
  }
}
