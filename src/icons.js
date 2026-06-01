/**
 * icons.js — WMO weather code → SVG icon & description mapping
 */

const descriptions = {
  0: 'Clear Sky',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  56: 'Light Freezing Drizzle',
  57: 'Dense Freezing Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  66: 'Light Freezing Rain',
  67: 'Heavy Freezing Rain',
  71: 'Slight Snowfall',
  73: 'Moderate Snowfall',
  75: 'Heavy Snowfall',
  77: 'Snow Grains',
  80: 'Light Showers',
  81: 'Moderate Showers',
  82: 'Violent Showers',
  85: 'Light Snow Showers',
  86: 'Heavy Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Hail',
  99: 'Severe Thunderstorm',
};

/**
 * Returns a human-readable weather description for a WMO code.
 */
export function getWeatherDescription(code) {
  return descriptions[code] || 'Unknown';
}

/* ---------- SVG Icon Builders ---------- */

function sun(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="12" fill="#f59e0b" opacity="0.9"/>
    <circle cx="32" cy="32" r="12" fill="none" stroke="#fbbf24" stroke-width="2" opacity="0.5">
      <animate attributeName="r" values="12;14;12" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3s" repeatCount="indefinite"/>
    </circle>
    <g stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" opacity="0.8">
      <line x1="32" y1="6" x2="32" y2="14"/>
      <line x1="32" y1="50" x2="32" y2="58"/>
      <line x1="6" y1="32" x2="14" y2="32"/>
      <line x1="50" y1="32" x2="58" y2="32"/>
      <line x1="13.6" y1="13.6" x2="19.3" y2="19.3"/>
      <line x1="44.7" y1="44.7" x2="50.4" y2="50.4"/>
      <line x1="13.6" y1="50.4" x2="19.3" y2="44.7"/>
      <line x1="44.7" y1="19.3" x2="50.4" y2="13.6"/>
    </g>
  </svg>`;
}

function cloud(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
    <path d="M20 44 C10 44 6 38 6 32 C6 26 10 22 16 21 C17 14 24 10 32 10 C40 10 46 15 48 22 C54 22 58 27 58 33 C58 39 54 44 47 44 Z" fill="#94a3b8" opacity="0.9"/>
  </svg>`;
}

function sunCloud(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
    <circle cx="22" cy="22" r="10" fill="#f59e0b" opacity="0.85"/>
    <g stroke="#f59e0b" stroke-width="2" stroke-linecap="round" opacity="0.6">
      <line x1="22" y1="4" x2="22" y2="10"/>
      <line x1="4" y1="22" x2="10" y2="22"/>
      <line x1="9.3" y1="9.3" x2="13.5" y2="13.5"/>
      <line x1="34.7" y1="9.3" x2="30.5" y2="13.5"/>
      <line x1="9.3" y1="34.7" x2="13.5" y2="30.5"/>
    </g>
    <path d="M22 48 C14 48 10 42 10 37 C10 32 14 28 18 27 C19 21 25 17 32 17 C39 17 44 21 46 27 C51 27 56 31 56 37 C56 43 51 48 45 48 Z" fill="#94a3b8" opacity="0.9"/>
  </svg>`;
}

function partlyCloudy(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
    <circle cx="24" cy="20" r="9" fill="#f59e0b" opacity="0.8"/>
    <g stroke="#f59e0b" stroke-width="2" stroke-linecap="round" opacity="0.5">
      <line x1="24" y1="4" x2="24" y2="9"/>
      <line x1="8" y1="20" x2="13" y2="20"/>
      <line x1="12.7" y1="8.7" x2="16.1" y2="12.1"/>
      <line x1="35.3" y1="8.7" x2="31.9" y2="12.1"/>
    </g>
    <path d="M18 50 C10 50 6 44 6 38 C6 33 10 29 15 28 C16 22 22 18 30 18 C37 18 42 22 44 28 C50 28 56 32 56 38 C56 44 50 50 44 50 Z" fill="#94a3b8" opacity="0.9"/>
  </svg>`;
}

function fog(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
    <path d="M18 30 C10 30 6 26 6 22 C6 17 10 14 14 13 C15 8 22 4 30 4 C37 4 42 8 44 14 C50 14 54 18 54 23 C54 28 50 30 44 30 Z" fill="#94a3b8" opacity="0.7"/>
    <g stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round" opacity="0.6">
      <line x1="10" y1="38" x2="54" y2="38">
        <animate attributeName="x1" values="10;14;10" dur="4s" repeatCount="indefinite"/>
      </line>
      <line x1="14" y1="44" x2="50" y2="44">
        <animate attributeName="x1" values="14;10;14" dur="4s" repeatCount="indefinite"/>
      </line>
      <line x1="10" y1="50" x2="54" y2="50">
        <animate attributeName="x1" values="10;16;10" dur="4s" repeatCount="indefinite"/>
      </line>
      <line x1="18" y1="56" x2="46" y2="56">
        <animate attributeName="x1" values="18;12;18" dur="4s" repeatCount="indefinite"/>
      </line>
    </g>
  </svg>`;
}

function rain(size, intensity = 'moderate') {
  const drops = intensity === 'light'
    ? [{ x: 20, d: 0.2 }, { x: 34, d: 0.5 }, { x: 46, d: 0.8 }]
    : intensity === 'heavy'
    ? [{ x: 16, d: 0 }, { x: 24, d: 0.3 }, { x: 32, d: 0.6 }, { x: 40, d: 0.1 }, { x: 48, d: 0.4 }]
    : [{ x: 20, d: 0 }, { x: 32, d: 0.4 }, { x: 44, d: 0.2 }, { x: 38, d: 0.7 }];

  const dropsSvg = drops.map(d => `
    <line x1="${d.x}" y1="40" x2="${d.x - 3}" y2="52" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" opacity="0.8">
      <animate attributeName="y1" values="38;50;38" dur="1s" begin="${d.d}s" repeatCount="indefinite"/>
      <animate attributeName="y2" values="46;58;46" dur="1s" begin="${d.d}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1s" begin="${d.d}s" repeatCount="indefinite"/>
    </line>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
    <path d="M18 36 C10 36 6 30 6 25 C6 20 10 16 15 15 C16 9 23 5 31 5 C38 5 44 9 46 15 C51 15 56 20 56 26 C56 32 51 36 45 36 Z" fill="#94a3b8" opacity="0.85"/>
    ${dropsSvg}
  </svg>`;
}

function snow(size, intensity = 'moderate') {
  const flakes = intensity === 'heavy'
    ? [18, 28, 38, 48, 23, 43]
    : [22, 34, 44, 30];

  const flakesSvg = flakes.map((x, i) => `
    <circle cx="${x}" cy="46" r="2" fill="#e2e8f0" opacity="0.9">
      <animate attributeName="cy" values="38;56;38" dur="${1.2 + i * 0.2}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.9;0.3;0.9" dur="${1.2 + i * 0.2}s" repeatCount="indefinite"/>
    </circle>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
    <path d="M18 34 C10 34 6 28 6 23 C6 18 10 14 15 13 C16 7 23 3 31 3 C38 3 44 7 46 13 C51 13 56 18 56 24 C56 30 51 34 45 34 Z" fill="#94a3b8" opacity="0.8"/>
    ${flakesSvg}
  </svg>`;
}

function thunderstorm(size, hasHail = false) {
  const hailSvg = hasHail ? `
    <circle cx="42" cy="50" r="2.5" fill="#06b6d4" opacity="0.8">
      <animate attributeName="cy" values="42;56;42" dur="0.9s" repeatCount="indefinite"/>
    </circle>
    <circle cx="48" cy="46" r="2" fill="#06b6d4" opacity="0.7">
      <animate attributeName="cy" values="40;54;40" dur="1.1s" repeatCount="indefinite"/>
    </circle>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
    <path d="M16 34 C8 34 4 28 4 23 C4 18 8 14 13 13 C14 7 21 3 29 3 C36 3 42 7 44 13 C49 13 54 18 54 24 C54 30 49 34 43 34 Z" fill="#64748b" opacity="0.9"/>
    <polygon points="30,30 24,44 30,44 26,58 40,40 33,40 38,30" fill="#facc15" opacity="0.95">
      <animate attributeName="opacity" values="0.95;0.4;0.95" dur="1.5s" repeatCount="indefinite"/>
    </polygon>
    ${hailSvg}
  </svg>`;
}

function drizzle(size, freezing = false) {
  const color = freezing ? '#06b6d4' : '#3b82f6';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
    <path d="M18 36 C10 36 6 30 6 25 C6 20 10 16 15 15 C16 9 23 5 31 5 C38 5 44 9 46 15 C51 15 56 20 56 26 C56 32 51 36 45 36 Z" fill="#94a3b8" opacity="0.8"/>
    <circle cx="22" cy="44" r="1.5" fill="${color}" opacity="0.7">
      <animate attributeName="cy" values="40;52;40" dur="1.4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="32" cy="46" r="1.5" fill="${color}" opacity="0.6">
      <animate attributeName="cy" values="42;54;42" dur="1.2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="42" cy="42" r="1.5" fill="${color}" opacity="0.7">
      <animate attributeName="cy" values="40;50;40" dur="1.6s" repeatCount="indefinite"/>
    </circle>
  </svg>`;
}

/**
 * Returns an inline SVG string for the given WMO weather code.
 */
export function getWeatherIcon(code, size = 64) {
  switch (code) {
    case 0:
      return sun(size);
    case 1:
      return sunCloud(size);
    case 2:
      return partlyCloudy(size);
    case 3:
      return cloud(size);
    case 45:
    case 48:
      return fog(size);
    case 51:
    case 56:
      return drizzle(size, code >= 56);
    case 53:
      return drizzle(size, false);
    case 55:
    case 57:
      return drizzle(size, code >= 56);
    case 61:
      return rain(size, 'light');
    case 63:
    case 80:
    case 81:
      return rain(size, 'moderate');
    case 65:
    case 82:
      return rain(size, 'heavy');
    case 66:
    case 67:
      return rain(size, 'moderate'); // freezing rain shown as rain
    case 71:
      return snow(size, 'light');
    case 73:
    case 77:
    case 85:
      return snow(size, 'moderate');
    case 75:
    case 86:
      return snow(size, 'heavy');
    case 95:
      return thunderstorm(size, false);
    case 96:
    case 99:
      return thunderstorm(size, true);
    default:
      return cloud(size);
  }
}
