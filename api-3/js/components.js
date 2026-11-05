/**
 * components.js - Reusable UI Components & Helpers
 */
const Components = (() => {
  const PLACEHOLDER_AGENT = 'assets/img/placeholder-agent.svg';
  const PLACEHOLDER_ABILITY = 'assets/img/placeholder-ability.svg';

  /**
   * Escape HTML to prevent XSS
   */
  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  /**
   * Show a Bootstrap Toast notification
   */
  const showToast = (message, title = 'VALORANT ARCHIVE', isError = false) => {
    let container = document.getElementById('archive-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'archive-toast-container';
      container.className = 'toast-container toast-container-archive';
      document.body.appendChild(container);
    }

    const toastId = 'toast-' + Math.random().toString(36).substring(2, 9);
    const toastEl = document.createElement('div');
    toastEl.className = 'toast archive-toast align-items-center show';
    toastEl.id = toastId;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
      <div class="toast-header">
        <span class="brand-accent-box me-2" style="width: 8px; height: 8px;"></span>
        <strong class="me-auto text-uppercase" style="font-family: var(--font-heading); letter-spacing: 1px;">${escapeHtml(title)}</strong>
        <small class="text-archive-muted">JUST NOW</small>
        <button type="button" class="btn-close btn-close-white ms-2" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body d-flex align-items-center">
        <span>${escapeHtml(message)}</span>
      </div>
    `;

    container.appendChild(toastEl);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      try {
        toastEl.classList.remove('show');
        setTimeout(() => toastEl.remove(), 300);
      } catch (e) {}
    }, 3800);

    const closeBtn = toastEl.querySelector('.btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toastEl.remove();
      });
    }
  };

  /**
   * Create an agent card element
   */
  const createAgentCard = (agent) => {
    const col = document.createElement('div');
    col.className = 'col';

    const isFav = Storage.isFavorite(agent.uuid);
    const portraitUrl = agent.displayIcon || agent.displayIconSmall || PLACEHOLDER_AGENT;
    const bgUrl = agent.background || '';
    const roleName = agent.role ? agent.role.displayName : 'Unknown Role';
    const roleIcon = agent.role && agent.role.displayIcon ? agent.role.displayIcon : '';

    col.innerHTML = `
      <div class="agent-card h-100" data-uuid="${agent.uuid}" tabindex="0" role="button" aria-label="View profile for ${escapeHtml(agent.displayName)}">
        <button class="agent-card-fav-btn ${isFav ? 'is-active' : ''}" 
                data-uuid="${agent.uuid}" 
                aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
                title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
          <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
        </button>

        <div class="agent-card-image-wrap">
          ${bgUrl ? `<div class="agent-card-bg-layer" style="background-image: url('${escapeHtml(bgUrl)}');"></div>` : ''}
          <img src="${escapeHtml(portraitUrl)}" 
               alt="${escapeHtml(agent.displayName)}" 
               class="agent-card-portrait" 
               loading="lazy" 
               onerror="this.onerror=null;this.src='${PLACEHOLDER_AGENT}';" />
        </div>

        <div class="agent-card-content">
          <div>
            <h3 class="agent-card-name">${escapeHtml(agent.displayName)}</h3>
            <div class="role-badge">
              ${roleIcon ? `<img src="${escapeHtml(roleIcon)}" alt="" />` : ''}
              <span>${escapeHtml(roleName)}</span>
            </div>
          </div>
          <div class="mt-2 text-end">
            <span class="text-archive-muted small d-inline-flex align-items-center gap-1">
              PROFILE <i class="bi bi-chevron-right" style="font-size: 0.75rem;"></i>
            </span>
          </div>
        </div>
      </div>
    `;

    const card = col.querySelector('.agent-card');
    const favBtn = col.querySelector('.agent-card-fav-btn');

    // Card navigation
    const navigateToProfile = () => {
      window.location.href = `agent.html?uuid=${agent.uuid}`;
    };

    card.addEventListener('click', (e) => {
      if (e.target.closest('.agent-card-fav-btn')) return;
      navigateToProfile();
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('.agent-card-fav-btn')) return;
        e.preventDefault();
        navigateToProfile();
      }
    });

    // Favorite toggle button
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const updated = Storage.toggleFavorite(agent.uuid);
      const icon = favBtn.querySelector('i');

      if (updated) {
        favBtn.classList.add('is-active');
        icon.className = 'bi bi-heart-fill';
        favBtn.setAttribute('aria-label', 'Remove from favorites');
        favBtn.title = 'Remove from favorites';
        showToast(`${agent.displayName} added to your favorites.`);
      } else {
        favBtn.classList.remove('is-active');
        icon.className = 'bi bi-heart';
        favBtn.setAttribute('aria-label', 'Add to favorites');
        favBtn.title = 'Add to favorites';
        showToast(`${agent.displayName} removed from your favorites.`);
      }
    });

    return col;
  };

  /**
   * Render Skeleton placeholder cards
   */
  const renderSkeletonCards = (count = 8) => {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="col">
          <div class="agent-card h-100" style="pointer-events: none; opacity: 0.7;">
            <div class="agent-card-image-wrap skeleton-box" style="aspect-ratio: 1 / 1.15;"></div>
            <div class="agent-card-content">
              <div class="skeleton-box mb-2" style="height: 24px; width: 65%;"></div>
              <div class="skeleton-box" style="height: 18px; width: 40%;"></div>
            </div>
          </div>
        </div>
      `;
    }
    return html;
  };

  /**
   * Render Error state with retry callback
   */
  const renderErrorState = (message, onRetry) => {
    const box = document.createElement('div');
    box.className = 'state-box';
    box.innerHTML = `
      <div class="state-icon text-archive-red">
        <i class="bi bi-exclamation-triangle"></i>
      </div>
      <h3 class="mb-2">UNABLE TO LOAD AGENTS</h3>
      <p class="text-archive-secondary mb-4">${escapeHtml(message || 'The agent archive could not retrieve the latest information. Please check your connection and try again.')}</p>
      <button class="btn btn-archive-primary btn-retry">
        <i class="bi bi-arrow-clockwise"></i> RETRY
      </button>
    `;

    if (onRetry) {
      box.querySelector('.btn-retry').addEventListener('click', onRetry);
    }
    return box;
  };

  /**
   * Render Empty state
   */
  const renderEmptyState = (title, message, buttonText, buttonHref) => {
    const box = document.createElement('div');
    box.className = 'state-box';
    box.innerHTML = `
      <div class="state-icon">
        <i class="bi bi-search"></i>
      </div>
      <h3 class="mb-2">${escapeHtml(title)}</h3>
      <p class="text-archive-secondary mb-4">${escapeHtml(message)}</p>
      ${buttonText && buttonHref ? `
        <a href="${escapeHtml(buttonHref)}" class="btn btn-archive-primary">
          ${escapeHtml(buttonText)}
        </a>
      ` : ''}
    `;
    return box;
  };

  return {
    PLACEHOLDER_AGENT,
    PLACEHOLDER_ABILITY,
    escapeHtml,
    showToast,
    createAgentCard,
    renderSkeletonCards,
    renderErrorState,
    renderEmptyState
  };
})();
