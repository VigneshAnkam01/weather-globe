/**
 * search.js — Location search with debounced autocomplete
 */

import { searchLocations } from './geocoding.js';
import { debounce } from './utils.js';

/**
 * Initialize the search bar with autocomplete functionality.
 *
 * @param {Function} onLocationSelect - Called with (lat, lng, name) when a result is picked
 */
export function initSearch(onLocationSelect) {
  const input = document.getElementById('search-input');
  const resultsContainer = document.getElementById('search-results');

  if (!input || !resultsContainer) return;

  let currentResults = [];

  // Debounced search function
  const performSearch = debounce(async (query) => {
    if (!query || query.length < 2) {
      hideResults();
      return;
    }

    try {
      const results = await searchLocations(query);
      currentResults = results;

      if (results.length === 0) {
        resultsContainer.innerHTML = `
          <div class="search-result-item" style="cursor: default; opacity: 0.5;">
            <div class="result-icon">🔍</div>
            <div class="result-info">
              <div class="result-name">No results found</div>
              <div class="result-country">Try a different search term</div>
            </div>
          </div>`;
        showResults();
        return;
      }

      resultsContainer.innerHTML = results
        .map(
          (r, i) => `
          <div class="search-result-item" data-index="${i}" data-lat="${r.lat}" data-lng="${r.lng}">
            <div class="result-icon">📍</div>
            <div class="result-info">
              <div class="result-name">${escapeHtml(r.name)}</div>
              <div class="result-country">${escapeHtml([r.state, r.country].filter(Boolean).join(', '))}</div>
            </div>
          </div>`
        )
        .join('');

      showResults();

      // Add click handlers to each result
      resultsContainer.querySelectorAll('.search-result-item[data-lat]').forEach((item) => {
        item.addEventListener('click', () => {
          const lat = parseFloat(item.dataset.lat);
          const lng = parseFloat(item.dataset.lng);
          const name = item.querySelector('.result-name')?.textContent || '';
          onLocationSelect(lat, lng, name);
          input.value = '';
          hideResults();
        });
      });
    } catch (err) {
      console.error('Search error:', err);
      hideResults();
    }
  }, 300);

  // Input event — trigger search
  input.addEventListener('input', (e) => {
    performSearch(e.target.value.trim());
  });

  // Keyboard navigation
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideResults();
      input.blur();
    }
    if (e.key === 'Enter' && currentResults.length > 0) {
      e.preventDefault();
      const first = currentResults[0];
      onLocationSelect(first.lat, first.lng, first.name);
      input.value = '';
      hideResults();
    }
  });

  // Click outside to close
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#search-wrapper')) {
      hideResults();
    }
  });

  function showResults() {
    resultsContainer.classList.add('visible');
  }

  function hideResults() {
    resultsContainer.classList.remove('visible');
    currentResults = [];
  }
}

/** Escape HTML to prevent XSS */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
