/**
 * agents.js - Logic for Agent Collection Page (agents.html)
 */
document.addEventListener('DOMContentLoaded', async () => {
  const agentsGrid = document.getElementById('agentsGrid');
  const searchInput = document.getElementById('agentSearchInput');
  const searchClearBtn = document.getElementById('agentSearchClearBtn');
  const roleFilterBtns = document.querySelectorAll('.role-filter-btn');
  const sortSelect = document.getElementById('agentSortSelect');
  const resultsCounter = document.getElementById('resultsCounter');
  const totalCountBadge = document.getElementById('totalAgentsBadge');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  const emptyStateContainer = document.getElementById('emptyStateContainer');

  let allAgents = [];
  let currentRoleFilter = 'ALL';
  let currentSearchQuery = '';
  let currentSort = 'name-asc';

  // Read URL query parameter for pre-filtering (e.g. ?role=Duelist)
  const urlParams = new URLSearchParams(window.location.search);
  const initialRoleParam = urlParams.get('role');
  if (initialRoleParam) {
    const matchedBtn = Array.from(roleFilterBtns).find(btn => 
      btn.getAttribute('data-role').toLowerCase() === initialRoleParam.toLowerCase()
    );
    if (matchedBtn) {
      currentRoleFilter = matchedBtn.getAttribute('data-role');
      roleFilterBtns.forEach(b => b.classList.remove('active'));
      matchedBtn.classList.add('active');
    }
  }

  // Filter & Sort Logic
  const getFilteredAgents = () => {
    let result = [...allAgents];

    // Role Filter
    if (currentRoleFilter !== 'ALL') {
      result = result.filter(agent => {
        return agent.role && agent.role.displayName.toLowerCase() === currentRoleFilter.toLowerCase();
      });
    }

    // Search Query
    if (currentSearchQuery.trim()) {
      const q = currentSearchQuery.trim().toLowerCase();
      result = result.filter(agent => {
        const name = (agent.displayName || '').toLowerCase();
        const role = (agent.role?.displayName || '').toLowerCase();
        return name.includes(q) || role.includes(q);
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
    const filtered = getFilteredAgents();

    // Update Counter
    if (resultsCounter) {
      resultsCounter.textContent = `SHOWING ${filtered.length} OF ${allAgents.length} AGENTS`;
    }

    // Toggle Clear Filters button visibility
    const isFiltered = currentRoleFilter !== 'ALL' || currentSearchQuery.trim().length > 0 || currentSort !== 'name-asc';
    if (clearFiltersBtn) {
      clearFiltersBtn.style.display = isFiltered ? 'inline-flex' : 'none';
    }

    // Toggle Clear Search button
    if (searchClearBtn) {
      searchClearBtn.style.display = currentSearchQuery.length > 0 ? 'block' : 'none';
    }

    // Empty state handling
    if (filtered.length === 0) {
      agentsGrid.innerHTML = '';
      if (emptyStateContainer) {
        emptyStateContainer.innerHTML = '';
        const emptyBox = document.createElement('div');
        emptyBox.className = 'state-box my-5';
        emptyBox.innerHTML = `
          <div class="state-icon text-archive-muted">
            <i class="bi bi-search"></i>
          </div>
          <h3 class="mb-2">NO AGENTS FOUND</h3>
          <p class="text-archive-secondary mb-4">We couldn't find any agents matching your search. Try another name or clear your filters.</p>
          <button class="btn btn-archive-primary" id="resetSearchBtn">
            <i class="bi bi-x-circle"></i> CLEAR SEARCH
          </button>
        `;
        emptyBox.querySelector('#resetSearchBtn').addEventListener('click', () => {
          resetAllFilters();
        });
        emptyStateContainer.appendChild(emptyBox);
        emptyStateContainer.style.display = 'block';
      }
      return;
    }

    if (emptyStateContainer) {
      emptyStateContainer.innerHTML = '';
      emptyStateContainer.style.display = 'none';
    }

    agentsGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    filtered.forEach(agent => {
      const card = Components.createAgentCard(agent);
      fragment.appendChild(card);
    });
    agentsGrid.appendChild(fragment);
  };

  // Reset all filters
  const resetAllFilters = () => {
    currentSearchQuery = '';
    currentRoleFilter = 'ALL';
    currentSort = 'name-asc';

    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'name-asc';

    roleFilterBtns.forEach(btn => {
      if (btn.getAttribute('data-role') === 'ALL') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Clean URL param
    if (window.history.pushState) {
      const newUrl = window.location.pathname;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }

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

  roleFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roleFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRoleFilter = btn.getAttribute('data-role');
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

  // Load Agents Data
  const loadAgents = async () => {
    if (agentsGrid) {
      agentsGrid.innerHTML = Components.renderSkeletonCards(10);
    }
    if (emptyStateContainer) {
      emptyStateContainer.innerHTML = '';
    }

    const res = await Api.getPlayableAgents();
    if (!res.success || !res.data) {
      if (agentsGrid) agentsGrid.innerHTML = '';
      if (emptyStateContainer) {
        emptyStateContainer.innerHTML = '';
        emptyStateContainer.appendChild(
          Components.renderErrorState(res.error, () => loadAgents())
        );
        emptyStateContainer.style.display = 'block';
      }
      return;
    }

    allAgents = res.data;

    if (totalCountBadge) {
      totalCountBadge.textContent = `${allAgents.length} PLAYABLE AGENTS AVAILABLE`;
    }

    renderGrid();
  };

  loadAgents();
});
