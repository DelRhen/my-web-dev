/**
 * favorites.js - Logic for Favorites Page (favorites.html)
 */
document.addEventListener('DOMContentLoaded', async () => {
  const favoritesGrid = document.getElementById('favoritesGrid');
  const favCountBadge = document.getElementById('favCountBadge');
  const emptyStateContainer = document.getElementById('emptyStateContainer');

  let allAgents = [];

  const renderFavorites = () => {
    const favoriteUuids = Storage.getFavorites();

    // Filter available agents matching the saved UUIDs
    const favAgents = favoriteUuids.map(uuid => {
      return allAgents.find(a => a.uuid.toLowerCase() === uuid.toLowerCase());
    }).filter(Boolean); // Ignore missing or unavailable agents gracefully

    // Update Counter
    if (favCountBadge) {
      favCountBadge.textContent = `${favAgents.length} SAVED AGENT${favAgents.length === 1 ? '' : 'S'}`;
    }

    if (favAgents.length === 0) {
      favoritesGrid.innerHTML = '';
      if (emptyStateContainer) {
        emptyStateContainer.innerHTML = '';
        const emptyBox = document.createElement('div');
        emptyBox.className = 'state-box my-5';
        emptyBox.innerHTML = `
          <div class="state-icon text-archive-muted">
            <i class="bi bi-heartbreak"></i>
          </div>
          <h3 class="mb-2">YOUR ARCHIVE IS EMPTY</h3>
          <p class="text-archive-secondary mb-4">You haven't saved any agents yet. Explore the collection and add your favorites.</p>
          <a href="agents.html" class="btn btn-archive-primary">
            <i class="bi bi-grid-fill"></i> EXPLORE AGENTS
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

    favoritesGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    favAgents.forEach(agent => {
      const cardCol = Components.createAgentCard(agent);
      fragment.appendChild(cardCol);
    });
    favoritesGrid.appendChild(fragment);
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
  };

  // Re-render when favorites change
  window.addEventListener('favoritesUpdated', () => {
    renderFavorites();
  });

  loadFavorites();
});
