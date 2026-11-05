/**
 * maps.js - Logic for Map Collection (maps.html)
 */
document.addEventListener('DOMContentLoaded', async () => {
  const mapsGrid = document.getElementById('mapsGrid');
  const searchInput = document.getElementById('mapSearchInput');
  const searchClearBtn = document.getElementById('mapSearchClearBtn');
  const siteFilterBtns = document.querySelectorAll('.site-filter-btn');
  const sortSelect = document.getElementById('mapSortSelect');
  const resultsCounter = document.getElementById('mapResultsCounter');
  const totalCountBadge = document.getElementById('totalMapsBadge');
  const clearFiltersBtn = document.getElementById('clearMapFiltersBtn');
  const emptyStateContainer = document.getElementById('mapEmptyStateContainer');

  let allMaps = [];
  let currentSiteFilter = 'ALL';
  let currentSearchQuery = '';
  let currentSort = 'name-asc';

  // Create single map card
  const createMapCard = (map) => {
    const col = document.createElement('div');
    col.className = 'col';

    const splashUrl = map.splash || Components.PLACEHOLDER_AGENT;
    const minimapUrl = map.displayIcon || '';
    const sitesText = map.tacticalDescription || 'Standard Arena';
    const calloutsCount = Array.isArray(map.callouts) ? map.callouts.length : 0;
    const descText = map.narrativeDescription || map.tacticalDescription || 'Tactical combat zone with strategic chokepoints and site objectives.';

    col.innerHTML = `
      <div class="map-card h-100" data-uuid="${map.uuid}" tabindex="0" role="button" aria-label="Explore ${Components.escapeHtml(map.displayName)}">
        <div class="map-card-image-wrap">
          <img src="${Components.escapeHtml(splashUrl)}" 
               alt="${Components.escapeHtml(map.displayName)}" 
               class="map-card-splash" 
               loading="lazy" 
               onerror="this.onerror=null;this.src='${Components.PLACEHOLDER_AGENT}';" />
          ${minimapUrl ? `
            <img src="${Components.escapeHtml(minimapUrl)}" 
                 alt="${Components.escapeHtml(map.displayName)} Minimap" 
                 class="map-card-minimap-thumb" 
                 title="Minimap layout" />
          ` : ''}
        </div>

        <div class="map-card-content">
          <div>
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h3 class="map-card-title mb-0">${Components.escapeHtml(map.displayName)}</h3>
              <span class="badge bg-archive-secondary border border-archive text-archive-red">
                ${Components.escapeHtml(sitesText)}
              </span>
            </div>
            <p class="map-card-desc">${Components.escapeHtml(descText)}</p>
          </div>

          <div>
            <div class="d-flex justify-content-between align-items-center border-top border-archive pt-3 mt-2">
              <span class="small text-archive-muted">
                <i class="bi bi-geo-alt text-archive-red me-1"></i> ${calloutsCount} CALLOUTS
              </span>
              <a href="map.html?uuid=${map.uuid}" class="btn btn-sm btn-archive-primary">
                VIEW MAP <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    const card = col.querySelector('.map-card');
    const navigateToMap = () => {
      window.location.href = `map.html?uuid=${map.uuid}`;
    };

    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      navigateToMap();
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigateToMap();
      }
    });

    return col;
  };

  // Filter & Sort Logic
  const getFilteredMaps = () => {
    let result = [...allMaps];

    // Filter out range / test duplicates without splash or callouts if any
    result = result.filter(m => m.splash && m.displayName);

    // Site filter (Two sites vs Three sites)
    if (currentSiteFilter === 'TWO_SITES') {
      result = result.filter(m => {
        const desc = (m.tacticalDescription || '').toLowerCase();
        return desc.includes('a/b') && !desc.includes('c');
      });
    } else if (currentSiteFilter === 'THREE_SITES') {
      result = result.filter(m => {
        const desc = (m.tacticalDescription || '').toLowerCase();
        return desc.includes('c') || m.displayName.toLowerCase() === 'haven' || m.displayName.toLowerCase() === 'lotus';
      });
    }

    // Search query
    if (currentSearchQuery.trim()) {
      const q = currentSearchQuery.trim().toLowerCase();
      result = result.filter(m => {
        const name = (m.displayName || '').toLowerCase();
        const desc = (m.tacticalDescription || '').toLowerCase();
        const narr = (m.narrativeDescription || '').toLowerCase();
        return name.includes(q) || desc.includes(q) || narr.includes(q);
      });
    }

    // Sorting
    result.sort((a, b) => {
      const nameA = a.displayName || '';
      const nameB = b.displayName || '';
      if (currentSort === 'name-desc') {
        return nameB.localeCompare(nameA);
      }
      return nameA.localeCompare(nameB);
    });

    return result;
  };

  // Render Grid
  const renderGrid = () => {
    const filtered = getFilteredMaps();

    if (resultsCounter) {
      resultsCounter.textContent = `SHOWING ${filtered.length} OF ${allMaps.length} MAPS`;
    }

    const isFiltered = currentSiteFilter !== 'ALL' || currentSearchQuery.trim().length > 0 || currentSort !== 'name-asc';
    if (clearFiltersBtn) {
      clearFiltersBtn.style.display = isFiltered ? 'inline-flex' : 'none';
    }

    if (searchClearBtn) {
      searchClearBtn.style.display = currentSearchQuery.length > 0 ? 'block' : 'none';
    }

    if (filtered.length === 0) {
      mapsGrid.innerHTML = '';
      if (emptyStateContainer) {
        emptyStateContainer.innerHTML = `
          <div class="state-box my-5">
            <div class="state-icon text-archive-muted">
              <i class="bi bi-map"></i>
            </div>
            <h3 class="mb-2">NO MAPS FOUND</h3>
            <p class="text-archive-secondary mb-4">No maps match your search. Try another map name or clear your filters.</p>
            <button class="btn btn-archive-primary" id="resetMapSearchBtn">
              <i class="bi bi-x-circle"></i> CLEAR SEARCH
            </button>
          </div>
        `;
        emptyStateContainer.querySelector('#resetMapSearchBtn').addEventListener('click', resetAllFilters);
        emptyStateContainer.style.display = 'block';
      }
      return;
    }

    if (emptyStateContainer) {
      emptyStateContainer.innerHTML = '';
      emptyStateContainer.style.display = 'none';
    }

    mapsGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    filtered.forEach(map => {
      fragment.appendChild(createMapCard(map));
    });
    mapsGrid.appendChild(fragment);
  };

  const resetAllFilters = () => {
    currentSearchQuery = '';
    currentSiteFilter = 'ALL';
    currentSort = 'name-asc';

    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'name-asc';

    siteFilterBtns.forEach(btn => {
      if (btn.getAttribute('data-site') === 'ALL') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    renderGrid();
  };

  // Event Listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      renderGrid();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentSearchQuery = '';
      renderGrid();
      searchInput.focus();
    });
  }

  siteFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      siteFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSiteFilter = btn.getAttribute('data-site');
      renderGrid();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderGrid();
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', resetAllFilters);
  }

  // Load Maps Data
  const loadMaps = async () => {
    if (mapsGrid) {
      mapsGrid.innerHTML = Components.renderSkeletonCards(6);
    }

    const res = await Api.getMaps();
    if (!res.success || !res.data) {
      if (mapsGrid) mapsGrid.innerHTML = '';
      if (emptyStateContainer) {
        emptyStateContainer.innerHTML = '';
        emptyStateContainer.appendChild(
          Components.renderErrorState(res.error, () => loadMaps())
        );
        emptyStateContainer.style.display = 'block';
      }
      return;
    }

    // Only keep maps that have displayable artwork and aren't purely null/empty
    allMaps = res.data.filter(m => m.splash);

    if (totalCountBadge) {
      totalCountBadge.textContent = `${allMaps.length} MAPS AVAILABLE`;
    }

    renderGrid();
  };

  loadMaps();
});
