/**
 * weather.js — Open-Meteo weather API integration with localStorage caching
 */

import { getFromCache, setToCache, roundCoord } from './utils.js';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Fetch current weather + 7-day forecast for given coordinates.
 * Results are cached in localStorage with a 30-minute TTL.
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Parsed weather data
 */
export async function fetchWeather(lat, lng) {
  lat = roundCoord(lat);
  lng = roundCoord(lng);

  // Check cache first
  const cacheKey = `weather_${lat}_${lng}`;
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Build request URL
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lng,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'cloud_cover',
      'precipitation',
      'surface_pressure',
      'is_day',
    ].join(','),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'weather_code',
      'precipitation_sum',
      'wind_speed_10m_max',
    ].join(','),
    forecast_days: 7,
    timezone: 'auto',
  });

  const response = await fetch(`${BASE_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();

  // Parse into clean structure
  const data = {
    current: {
      temperature: raw.current.temperature_2m,
      feelsLike: raw.current.apparent_temperature,
      humidity: raw.current.relative_humidity_2m,
      weatherCode: raw.current.weather_code,
      windSpeed: raw.current.wind_speed_10m,
      windDirection: raw.current.wind_direction_10m,
      cloudCover: raw.current.cloud_cover,
      precipitation: raw.current.precipitation,
      pressure: raw.current.surface_pressure,
      isDay: raw.current.is_day === 1,
    },
    daily: raw.daily.time.map((date, i) => ({
      date,
      tempMax: raw.daily.temperature_2m_max[i],
      tempMin: raw.daily.temperature_2m_min[i],
      weatherCode: raw.daily.weather_code[i],
      precipitation: raw.daily.precipitation_sum[i],
      windSpeed: raw.daily.wind_speed_10m_max[i],
    })),
    timezone: raw.timezone,
  };

  // Cache result (30 minutes)
  setToCache(cacheKey, data, 30);

  return data;
}
