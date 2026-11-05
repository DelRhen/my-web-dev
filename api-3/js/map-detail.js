/**
 * map-detail.js - Logic for Individual Map Tactics & Interactive Minimap (map.html)
 */
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const uuid = urlParams.get('uuid');

  const mapContent = document.getElementById('mapContent');
  const mapLoading = document.getElementById('mapLoading');
  const mapError = document.getElementById('mapError');

  // Breadcrumbs & Hero Elements
  const breadcrumbMapName = document.getElementById('breadcrumbMapName');
  const mapHeroName = document.getElementById('mapHeroName');
  const mapHeroTitle = document.getElementById('mapHeroTitle');
  const mapHeroDesc = document.getElementById('mapHeroDesc');
  const mapHeroBackdrop = document.getElementById('mapHeroBackdrop');
  const mapCoordinatesBadge = document.getElementById('mapCoordinatesBadge');
  const mapSitesBadge = document.getElementById('mapSitesBadge');
  const mapCalloutsBadge = document.getElementById('mapCalloutsBadge');

  // Interactive Minimap Elements
  const minimapStage = document.getElementById('minimapStage');
  const minimapImg = document.getElementById('minimapImg');
  const minimapMarkersContainer = document.getElementById('minimapMarkersContainer');
  const minimapContainer = document.getElementById('minimapViewportContainer');

  // Minimap Controls
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const zoomResetBtn = document.getElementById('zoomResetBtn');
  const toggleCalloutsBtn = document.getElementById('toggleCalloutsBtn');

  // Callout Search & Directory
  const calloutSearchInput = document.getElementById('calloutSearchInput');
  const calloutDirectoryList = document.getElementById('calloutDirectoryList');
  const calloutDirectoryCount = document.getElementById('calloutDirectoryCount');

  // Strategy Tabs & Grid
  const strategyTabBtns = document.querySelectorAll('.strategy-tab-btn');
  const strategiesGrid = document.getElementById('strategiesGrid');

  // Related Maps Grid
  const relatedMapsGrid = document.getElementById('relatedMapsGrid');

  let currentMap = null;
  let allMaps = [];
  let allAgents = [];
  let calloutsVisible = true;
  let currentZoom = 1.0;
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let startPanX = 0;
  let startPanY = 0;
  let activeStrategyCategory = 'ATTACK';
  let activeCalloutMarker = null;

  if (!uuid) {
    showError("No map selected. Please return to the map collection.");
    return;
  }

  function showError(msg) {
    if (mapLoading) mapLoading.style.display = 'none';
    if (mapContent) mapContent.style.display = 'none';
    if (mapError) {
      mapError.innerHTML = `
        <div class="state-box my-5">
          <div class="state-icon text-archive-red">
            <i class="bi bi-geo-alt"></i>
          </div>
          <h3 class="mb-2">MAP NOT FOUND</h3>
          <p class="text-archive-secondary mb-4">${Components.escapeHtml(msg || "The map you're looking for may be unavailable.")}</p>
          <a href="maps.html" class="btn btn-archive-primary">
            <i class="bi bi-arrow-left"></i> BACK TO MAPS
          </a>
        </div>
      `;
      mapError.style.display = 'block';
    }
  }

  // Update Minimap Transform (Zoom & Pan)
  const updateMinimapTransform = () => {
    if (minimapStage) {
      minimapStage.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
    }
  };

  // Setup Minimap Controls & Pan/Zoom Handlers
  const setupMinimapInteractions = () => {
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        currentZoom = Math.min(currentZoom + 0.25, 2.8);
        updateMinimapTransform();
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        currentZoom = Math.max(currentZoom - 0.25, 0.75);
        if (currentZoom <= 1.0) {
          panX = 0;
          panY = 0;
        }
        updateMinimapTransform();
      });
    }

    if (zoomResetBtn) {
      zoomResetBtn.addEventListener('click', () => {
        currentZoom = 1.0;
        panX = 0;
        panY = 0;
        updateMinimapTransform();
      });
    }

    if (toggleCalloutsBtn) {
      toggleCalloutsBtn.addEventListener('click', () => {
        calloutsVisible = !calloutsVisible;
        if (minimapMarkersContainer) {
          minimapMarkersContainer.style.display = calloutsVisible ? 'block' : 'none';
        }
        toggleCalloutsBtn.innerHTML = calloutsVisible 
          ? '<i class="bi bi-eye-slash"></i> HIDE CALLOUTS' 
          : '<i class="bi bi-eye"></i> SHOW CALLOUTS';
      });
    }

    // Pan Handlers
    if (minimapContainer) {
      minimapContainer.addEventListener('mousedown', (e) => {
        if (e.target.closest('.callout-marker')) return;
        isPanning = true;
        startPanX = e.clientX - panX;
        startPanY = e.clientY - panY;
      });

      window.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        panX = e.clientX - startPanX;
        panY = e.clientY - startPanY;
        updateMinimapTransform();
      });

      window.addEventListener('mouseup', () => {
        isPanning = false;
      });

      // Mouse Wheel Zoom
      minimapContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.15 : -0.15;
        currentZoom = Math.min(Math.max(currentZoom + delta, 0.75), 2.8);
        if (currentZoom <= 1.0) {
          panX = 0;
          panY = 0;
        }
        updateMinimapTransform();
      }, { passive: false });
    }
  };

  // Render Callout Markers on Minimap using API Transformation Formula
  const renderCalloutMarkers = (map) => {
    if (!minimapMarkersContainer) return;
    minimapMarkersContainer.innerHTML = '';

    const callouts = Array.isArray(map.callouts) ? map.callouts : [];
    const hasCoordinates = map.xMultiplier && map.yMultiplier && map.xMultiplier !== 0;

    if (!hasCoordinates || callouts.length === 0) {
      // Fallback message if accurate coordinates are not supported
      const notice = document.createElement('div');
      notice.className = 'small text-archive-muted p-2 text-center';
      notice.innerHTML = '<i class="bi bi-info-circle"></i> Minimap marker positioning is not available for this map. Use the Callout Directory below.';
      minimapContainer.parentElement.appendChild(notice);
      return;
    }

    callouts.forEach((callout, index) => {
      // Valorant API Coordinate formula:
      // normalized X = (location.y * xMultiplier) + xScalarToAdd
      // normalized Y = (location.x * yMultiplier) + yScalarToAdd
      const leftPercent = ((callout.location.y * map.xMultiplier) + map.xScalarToAdd) * 100;
      const topPercent = ((callout.location.x * map.yMultiplier) + map.yScalarToAdd) * 100;

      // Bounds sanity check
      if (leftPercent < 0 || leftPercent > 100 || topPercent < 0 || topPercent > 100) return;

      const marker = document.createElement('div');
      marker.className = 'callout-marker';
      marker.style.left = `${leftPercent}%`;
      marker.style.top = `${topPercent}%`;
      marker.setAttribute('data-index', index);
      marker.setAttribute('data-name', (callout.regionName || '').toLowerCase());
      marker.setAttribute('data-super', (callout.superRegionName || '').toLowerCase());

      const fullName = callout.superRegionName 
        ? `${callout.superRegionName} ${callout.regionName}` 
        : callout.regionName;

      marker.innerHTML = `
        <div class="callout-dot"></div>
        <div class="callout-label-tooltip">${Components.escapeHtml(fullName)}</div>
      `;

      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        selectCallout(callout, marker);
      });

      minimapMarkersContainer.appendChild(marker);
    });
  };

  // Select / Highlight a Callout Marker & Directory Item
  const selectCallout = (callout, markerEl) => {
    // Unmark previous
    if (activeCalloutMarker) {
      activeCalloutMarker.classList.remove('is-active');
    }

    if (markerEl) {
      markerEl.classList.add('is-active');
      activeCalloutMarker = markerEl;
    }

    // Highlight in directory
    const items = calloutDirectoryList.querySelectorAll('.callout-directory-item');
    items.forEach(item => {
      const itemName = item.getAttribute('data-name');
      if (itemName === (callout.regionName || '').toLowerCase()) {
        item.classList.add('is-selected');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('is-selected');
      }
    });

    Components.showToast(`${callout.superRegionName || ''} ${callout.regionName}`, 'TACTICAL CALLOUT');
  };

  // Render Callout Directory
  const renderCalloutDirectory = (map) => {
    if (!calloutDirectoryList) return;
    const callouts = Array.isArray(map.callouts) ? map.callouts : [];

    if (calloutDirectoryCount) {
      calloutDirectoryCount.textContent = `${callouts.length} TOTAL`;
    }

    if (callouts.length === 0) {
      calloutDirectoryList.innerHTML = `
        <div class="p-3 text-archive-muted text-center small">No callout records cataloged for this map.</div>
      `;
      return;
    }

    calloutDirectoryList.innerHTML = '';
    callouts.forEach(c => {
      const item = document.createElement('div');
      item.className = 'callout-directory-item';
      item.setAttribute('data-name', (c.regionName || '').toLowerCase());
      item.setAttribute('data-super', (c.superRegionName || '').toLowerCase());

      item.innerHTML = `
        <div>
          <strong class="text-white d-block">${Components.escapeHtml(c.regionName)}</strong>
          <small class="text-archive-muted">${Components.escapeHtml(c.superRegionName || 'General Area')}</small>
        </div>
        <div>
          <span class="badge bg-archive-secondary border border-archive text-archive-secondary small">
            VIEW <i class="bi bi-crosshair"></i>
          </span>
        </div>
      `;

      item.addEventListener('click', () => {
        // Find corresponding marker on minimap
        const markers = minimapMarkersContainer.querySelectorAll('.callout-marker');
        let matchedMarker = null;
        markers.forEach(m => {
          if (m.getAttribute('data-name') === (c.regionName || '').toLowerCase()) {
            matchedMarker = m;
          }
        });
        selectCallout(c, matchedMarker);
      });

      calloutDirectoryList.appendChild(item);
    });
  };

  // Callout Directory Search Handler
  if (calloutSearchInput) {
    calloutSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      const items = calloutDirectoryList.querySelectorAll('.callout-directory-item');
      const markers = minimapMarkersContainer.querySelectorAll('.callout-marker');

      items.forEach(item => {
        const name = item.getAttribute('data-name') || '';
        const superRegion = item.getAttribute('data-super') || '';
        const matches = name.includes(q) || superRegion.includes(q);
        item.style.display = matches ? 'flex' : 'none';
      });

      markers.forEach(m => {
        const name = m.getAttribute('data-name') || '';
        const superRegion = m.getAttribute('data-super') || '';
        const matches = name.includes(q) || superRegion.includes(q);
        m.style.opacity = matches ? '1' : '0.2';
      });
    });
  }

  // Render Strategies for Active Category
  const renderStrategies = () => {
    if (!strategiesGrid || !currentMap) return;
    const allStrategies = MapStrategies.getStrategiesForMap(currentMap);
    const filtered = allStrategies.filter(s => s.category.toUpperCase() === activeStrategyCategory.toUpperCase());

    if (filtered.length === 0) {
      strategiesGrid.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="text-archive-muted">No ${activeStrategyCategory} strategies recorded yet for ${currentMap.displayName}.</p>
        </div>
      `;
      return;
    }

    strategiesGrid.innerHTML = '';
    filtered.forEach(strat => {
      const col = document.createElement('div');
      col.className = 'col-lg-6 col-12';

      const diffClass = strat.difficulty.toLowerCase() === 'beginner' 
        ? 'difficulty-beginner' 
        : strat.difficulty.toLowerCase() === 'intermediate' 
        ? 'difficulty-intermediate' 
        : 'difficulty-advanced';

      const rolesHtml = (strat.recommendedRoles || []).map(r => 
        `<span class="role-badge me-1">${Components.escapeHtml(r)}</span>`
      ).join('');

      col.innerHTML = `
        <div class="strategy-card">
          <div>
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-archive-secondary border border-archive text-archive-red fw-bold">
                ${Components.escapeHtml(strat.site)}
              </span>
              <span class="strategy-difficulty-badge ${diffClass}">
                ${Components.escapeHtml(strat.difficulty)}
              </span>
            </div>
            <h3 class="font-heading fs-4 mb-2">${Components.escapeHtml(strat.name)}</h3>
            <p class="text-archive-secondary small mb-3">${Components.escapeHtml(strat.description)}</p>
          </div>

          <div>
            <div class="mb-3">
              <small class="text-archive-muted d-block mb-1 text-uppercase fw-bold" style="font-size: 0.72rem;">RECOMMENDED ROLES:</small>
              <div class="d-flex flex-wrap gap-1">${rolesHtml}</div>
            </div>
            <button class="btn btn-archive-primary btn-sm w-100 btn-view-strategy">
              VIEW STRATEGY <i class="bi bi-chevron-right ms-1"></i>
            </button>
          </div>
        </div>
      `;

      col.querySelector('.btn-view-strategy').addEventListener('click', () => {
        openStrategyModal(strat);
      });

      strategiesGrid.appendChild(col);
    });
  };

  // Strategy Category Tab Switching
  strategyTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      strategyTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStrategyCategory = btn.getAttribute('data-category');
      renderStrategies();
    });
  });

  // Open Detailed Strategy View Modal
  const openStrategyModal = (strat) => {
    const modalEl = document.getElementById('strategyDetailModal');
    if (!modalEl) return;

    document.getElementById('stratModalTitle').textContent = `${currentMap.displayName} — ${strat.name}`;
    document.getElementById('stratModalCategory').textContent = strat.category;
    document.getElementById('stratModalSite').textContent = strat.site;
    document.getElementById('stratModalDifficulty').textContent = strat.difficulty;
    document.getElementById('stratModalObjective').textContent = strat.objective;

    // Steps
    const stepsContainer = document.getElementById('stratModalStepsContainer');
    stepsContainer.innerHTML = '';
    (strat.steps || []).forEach(step => {
      const stepItem = document.createElement('div');
      stepItem.className = 'strategy-step-item';
      stepItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong class="text-archive-red font-heading fs-5">${Components.escapeHtml(step.title)}</strong>
          ${step.callout ? `<span class="badge bg-archive-secondary border border-archive text-archive-secondary small"><i class="bi bi-geo-alt"></i> ${Components.escapeHtml(step.callout)}</span>` : ''}
        </div>
        <p class="text-archive-secondary small mb-0">${Components.escapeHtml(step.description)}</p>
      `;
      stepsContainer.appendChild(stepItem);
    });

    // Recommended Agents
    const agentsContainer = document.getElementById('stratModalAgentsContainer');
    agentsContainer.innerHTML = '';
    (strat.recommendedAgents || []).forEach(rec => {
      const matchedAgent = allAgents.find(a => a.displayName.toLowerCase() === rec.name.toLowerCase());
      const portrait = matchedAgent ? (matchedAgent.displayIcon || matchedAgent.displayIconSmall) : Components.PLACEHOLDER_AGENT;
      const agentLink = matchedAgent ? `agent.html?uuid=${matchedAgent.uuid}` : '#';

      const agentCard = document.createElement('div');
      agentCard.className = 'col-md-4 col-12';
      agentCard.innerHTML = `
        <a href="${agentLink}" class="text-decoration-none">
          <div class="strategy-agent-rec-card h-100">
            <img src="${Components.escapeHtml(portrait)}" alt="${Components.escapeHtml(rec.name)}" class="strategy-agent-thumb" />
            <div>
              <strong class="text-white d-block">${Components.escapeHtml(rec.name)}</strong>
              <small class="text-archive-red d-block mb-1">${Components.escapeHtml(rec.ability)}</small>
              <p class="text-archive-muted mb-0" style="font-size: 0.76rem; line-height: 1.3;">${Components.escapeHtml(rec.explanation)}</p>
            </div>
          </div>
        </a>
      `;
      agentsContainer.appendChild(agentCard);
    });

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  };

  // Render Related Maps (Excluding current)
  const renderRelatedMaps = () => {
    if (!relatedMapsGrid || allMaps.length === 0) return;
    relatedMapsGrid.innerHTML = '';

    const others = allMaps.filter(m => m.uuid !== currentMap.uuid && m.splash).slice(0, 4);
    others.forEach(m => {
      const col = document.createElement('div');
      col.className = 'col-lg-3 col-sm-6 col-12';
      col.innerHTML = `
        <div class="map-card h-100" tabindex="0" role="button">
          <div class="map-card-image-wrap">
            <img src="${Components.escapeHtml(m.splash)}" alt="${Components.escapeHtml(m.displayName)}" class="map-card-splash" />
          </div>
          <div class="p-3 bg-archive-card d-flex justify-content-between align-items-center">
            <h4 class="font-heading fs-5 mb-0">${Components.escapeHtml(m.displayName)}</h4>
            <a href="map.html?uuid=${m.uuid}" class="btn btn-sm btn-archive-secondary">
              VIEW <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>
      `;
      col.querySelector('.map-card').addEventListener('click', () => {
        window.location.href = `map.html?uuid=${m.uuid}`;
      });
      relatedMapsGrid.appendChild(col);
    });
  };

  // Load Map Data
  const loadMapDetails = async () => {
    if (mapLoading) mapLoading.style.display = 'block';
    if (mapContent) mapContent.style.display = 'none';
    if (mapError) mapError.style.display = 'none';

    const [mapRes, allMapsRes, agentsRes] = await Promise.all([
      Api.getMapByUuid(uuid),
      Api.getMaps(),
      Api.getPlayableAgents()
    ]);

    if (!mapRes.success || !mapRes.data) {
      showError(mapRes.error);
      return;
    }

    currentMap = mapRes.data;
    allMaps = (allMapsRes.success && allMapsRes.data) ? allMapsRes.data : [];
    allAgents = (agentsRes.success && agentsRes.data) ? agentsRes.data : [];

    // Document title
    document.title = `${currentMap.displayName} Tactics | VALORANT Agent Archive`;

    // Breadcrumb & Hero Details
    if (breadcrumbMapName) breadcrumbMapName.textContent = currentMap.displayName;
    if (mapHeroName) mapHeroName.textContent = currentMap.displayName;
    if (mapHeroTitle) mapHeroTitle.textContent = `EXPLORE ${currentMap.displayName.toUpperCase()}`;
    if (mapHeroDesc) {
      mapHeroDesc.textContent = currentMap.narrativeDescription || currentMap.tacticalDescription || 'Study the layout and discover important tactical areas of the battlefield.';
    }
    if (mapHeroBackdrop && currentMap.splash) {
      mapHeroBackdrop.src = currentMap.splash;
    }
    if (mapCoordinatesBadge) {
      mapCoordinatesBadge.textContent = currentMap.coordinates ? `COORDS: ${currentMap.coordinates}` : 'COORDINATES: UNCLASSIFIED';
    }
    if (mapSitesBadge) {
      mapSitesBadge.textContent = currentMap.tacticalDescription || 'STANDARD SITES';
    }
    if (mapCalloutsBadge) {
      const cCount = Array.isArray(currentMap.callouts) ? currentMap.callouts.length : 0;
      mapCalloutsBadge.textContent = `${cCount} CALLOUTS`;
    }

    // Minimap Setup
    if (minimapImg && currentMap.displayIcon) {
      minimapImg.src = currentMap.displayIcon;
      minimapImg.alt = `${currentMap.displayName} Minimap`;
    }

    setupMinimapInteractions();
    renderCalloutMarkers(currentMap);
    renderCalloutDirectory(currentMap);
    renderStrategies();
    renderRelatedMaps();

    if (mapLoading) mapLoading.style.display = 'none';
    if (mapContent) mapContent.style.display = 'block';
  };

  loadMapDetails();
});
