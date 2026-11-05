/**
 * favorites.js - Logic for Favorites Page (favorites.html)
 * Supports both Agent favorites and Cosmetic items favorites
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const favoritesGrid = document.getElementById('favoritesGrid');
  const favCountBadge = document.getElementById('favCountBadge');
  const favCosmeticsCountBadge = document.getElementById('favCosmeticsCountBadge');
  const favAgentsTabCount = document.getElementById('favAgentsTabCount');
  const favCosmeticsTabCount = document.getElementById('favCosmeticsTabCount');
  const emptyStateContainer = document.getElementById('emptyStateContainer');
  const emptyCosmeticsContainer = document.getElementById('emptyCosmeticsStateContainer');
  const cosmeticsGrid = document.getElementById('cosmeticsFavoritesGrid');

  const tabFavAgents = document.getElementById('tabFavAgents');
  const tabFavCosmetics = document.getElementById('tabFavCosmetics');
  const agentsFavView = document.getElementById('agentsFavView');
  const cosmeticsFavView = document.getElementById('cosmeticsFavView');

  let allAgents = [];

  // Tab switching
  if (tabFavAgents && tabFavCosmetics) {
    tabFavAgents.addEventListener('click', () => {
      tabFavAgents.classList.add('active');
      tabFavCosmetics.classList.remove('active');
      if (agentsFavView) agentsFavView.style.display = 'block';
      if (cosmeticsFavView) cosmeticsFavView.style.display = 'none';
    });

    tabFavCosmetics.addEventListener('click', () => {
      tabFavCosmetics.classList.add('active');
      tabFavAgents.classList.remove('active');
      if (agentsFavView) agentsFavView.style.display = 'none';
      if (cosmeticsFavView) cosmeticsFavView.style.display = 'block';
      renderCosmeticFavorites();
    });
  }

  // Render Agents
  const renderFavorites = () => {
    const favoriteUuids = Storage.getFavorites();

    // Filter available agents matching the saved UUIDs
    const favAgents = favoriteUuids.map(uuid => {
      return allAgents.find(a => a.uuid.toLowerCase() === uuid.toLowerCase());
    }).filter(Boolean); // Ignore missing or unavailable agents gracefully

    // Update Counter Badges
    const countText = `${favAgents.length} SAVED AGENT${favAgents.length === 1 ? '' : 'S'}`;
    if (favCountBadge) favCountBadge.textContent = countText;
    if (favAgentsTabCount) favAgentsTabCount.textContent = favAgents.length;

    if (favAgents.length === 0) {
      if (favoritesGrid) favoritesGrid.innerHTML = '';
      if (emptyStateContainer) {
        emptyStateContainer.innerHTML = '';
        const emptyBox = document.createElement('div');
        emptyBox.className = 'state-box my-5';
        emptyBox.innerHTML = `
          <div class="state-icon text-archive-muted">
            <i class="bi bi-heartbreak"></i>
          </div>
          <h3 class="mb-2">YOUR AGENT ARCHIVE IS EMPTY</h3>
          <p class="text-archive-secondary mb-4">You haven't saved any agents yet. Explore the agent roster and bookmark your favorites.</p>
          <a href="agents.html" class="btn btn-archive-primary">
            <i class="bi bi-grid-fill me-1"></i> EXPLORE AGENTS
          </a>
        `;
        emptyStateContainer.appendChild(emptyBox);
        emptyStateContainer.style.display = 'block';
      }
      return;
    }

    if (emptyStateContainer) {
      emptyStateContainer.innerHTML = '';
      emptyStateContainer.style.display = 'none';
    }

    if (favoritesGrid) {
      favoritesGrid.innerHTML = '';
      const fragment = document.createDocumentFragment();
      favAgents.forEach(agent => {
        const cardCol = Components.createAgentCard(agent);
        fragment.appendChild(cardCol);
      });
      favoritesGrid.appendChild(fragment);
    }
  };

  // Render Cosmetic Favorites
  const renderCosmeticFavorites = () => {
    const cosmeticFavs = Storage.getCosmeticFavorites();

    const countText = `${cosmeticFavs.length} SAVED COSMETIC${cosmeticFavs.length === 1 ? '' : 'S'}`;
    if (favCosmeticsCountBadge) favCosmeticsCountBadge.textContent = countText;
    if (favCosmeticsTabCount) favCosmeticsTabCount.textContent = cosmeticFavs.length;

    if (cosmeticFavs.length === 0) {
      if (cosmeticsGrid) cosmeticsGrid.innerHTML = '';
      if (emptyCosmeticsContainer) {
        emptyCosmeticsContainer.innerHTML = `
          <div class="state-box my-5">
            <div class="state-icon text-archive-muted">
              <i class="bi bi-palette"></i>
            </div>
            <h3 class="mb-2">NO SAVED COSMETICS</h3>
            <p class="text-archive-secondary mb-4">You haven't saved any player cards, sprays, weapon skins, or gun buddies yet.</p>
            <a href="collections.html" class="btn btn-archive-primary">
              <i class="bi bi-collection-fill me-1"></i> EXPLORE COLLECTIONS
            </a>
          </div>
        `;
        emptyCosmeticsContainer.style.display = 'block';
      }
      return;
    }

    if (emptyCosmeticsContainer) {
      emptyCosmeticsContainer.innerHTML = '';
      emptyCosmeticsContainer.style.display = 'none';
    }

    if (!cosmeticsGrid) return;
    cosmeticsGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    cosmeticFavs.forEach(item => {
      const col = document.createElement('div');
      col.className = 'col-6 col-sm-4 col-md-3 col-lg-2 mb-3';

      let typeBadgeClass = 'badge-card';
      if (item.type === 'spray') typeBadgeClass = 'badge-spray';
      else if (item.type === 'skin') typeBadgeClass = 'badge-skin';
      else if (item.type === 'buddy') typeBadgeClass = 'badge-buddy';

      col.innerHTML = `
        <div class="collection-item-card h-100 ${item.type}-card">
          <button class="collection-fav-btn active" data-uuid="${Components.escapeHtml(item.uuid)}" title="Remove from favorites">
            <i class="bi bi-heart-fill"></i>
          </button>
          <div class="collection-img-wrap ${item.type}-img-wrap">
            <img src="${Components.escapeHtml(item.icon)}" alt="${Components.escapeHtml(item.name)}" class="collection-img img-fluid" loading="lazy">
          </div>
          <div class="collection-card-body">
            <span class="collection-type-badge ${typeBadgeClass} mb-1">${Components.escapeHtml((item.type || 'item').toUpperCase())}</span>
            <h5 class="collection-item-title text-truncate" title="${Components.escapeHtml(item.name)}">${Components.escapeHtml(item.name)}</h5>
            ${item.extra ? `<p class="collection-item-extra text-truncate mb-0">${Components.escapeHtml(item.extra)}</p>` : ''}
          </div>
        </div>
      `;

      // Remove button listener
      const favBtn = col.querySelector('.collection-fav-btn');
      if (favBtn) {
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          Storage.removeCosmeticFavorite(item.uuid);
          renderCosmeticFavorites();
        });
      }

      fragment.appendChild(col);
    });

    cosmeticsGrid.appendChild(fragment);
  };

  const loadFavorites = async () => {
    if (favoritesGrid) {
      favoritesGrid.innerHTML = Components.renderSkeletonCards(4);
    }

    const res = await Api.getPlayableAgents();
    if (!res.success || !res.data) {
      if (favoritesGrid) favoritesGrid.innerHTML = '';
      if (emptyStateContainer) {
        emptyStateContainer.innerHTML = '';
        emptyStateContainer.appendChild(
          Components.renderErrorState(res.error, () => loadFavorites())
        );
        emptyStateContainer.style.display = 'block';
      }
      return;
    }

    allAgents = res.data;
    renderFavorites();
    renderCosmeticFavorites();
  };

  // Re-render when favorites change
  window.addEventListener('favoritesUpdated', () => {
    renderFavorites();
  });

  window.addEventListener('cosmeticFavoritesUpdated', () => {
    renderCosmeticFavorites();
  });

  loadFavorites();
});
