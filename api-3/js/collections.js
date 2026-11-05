/**
 * collections.js - VALORANT Collection Gallery Controller
 * Manages Player Cards, Sprays, Weapon Skins, and Gun Buddies
 * With 20 items per page pagination
 */
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const statCardsEl = document.getElementById('statCards');
  const statSpraysEl = document.getElementById('statSprays');
  const statSkinsEl = document.getElementById('statSkins');
  const statBuddiesEl = document.getElementById('statBuddies');

  const tabButtons = document.querySelectorAll('[data-collection-tab]');
  const searchInput = document.getElementById('collectionSearch');
  const clearSearchBtn = document.getElementById('clearCollectionSearch');
  const sortSelect = document.getElementById('collectionSort');
  const weaponFilterSelect = document.getElementById('weaponFilterSelect');
  const weaponFilterContainer = document.getElementById('weaponFilterContainer');
  const favoritesToggleBtn = document.getElementById('collectionFavToggle');

  const galleryGrid = document.getElementById('collectionGrid');
  const galleryCountEl = document.getElementById('collectionCount');
  const galleryLoading = document.getElementById('collectionLoading');
  const galleryError = document.getElementById('collectionError');

  // Pagination Elements
  const paginationContainer = document.getElementById('paginationContainer');
  const paginationList = document.getElementById('paginationList');
  const paginationInfo = document.getElementById('paginationInfo');
  const jumpToPageInput = document.getElementById('jumpToPageInput');
  const jumpToPageBtn = document.getElementById('jumpToPageBtn');

  // Modal Elements
  const previewModalEl = document.getElementById('collectionPreviewModal');
  const bsModal = previewModalEl ? new bootstrap.Modal(previewModalEl) : null;
  const modalImg = document.getElementById('modalItemImg');
  const modalTitle = document.getElementById('modalItemTitle');
  const modalType = document.getElementById('modalItemType');
  const modalUuid = document.getElementById('modalItemUuid');
  const modalExtraInfo = document.getElementById('modalExtraInfo');
  const modalFavBtn = document.getElementById('modalFavBtn');
  const modalChromasContainer = document.getElementById('modalChromasContainer');

  // State
  let currentCategory = 'all'; // 'all' | 'cards' | 'sprays' | 'skins' | 'buddies'
  let currentSearch = '';
  let currentSort = 'asc'; // 'asc' | 'desc'
  let currentWeapon = 'all';
  let showFavoritesOnly = false;
  let currentPage = 1;
  const ITEMS_PER_PAGE = 20; // 20 items per page as requested

  // Raw API Datasets
  let allCards = [];
  let allSprays = [];
  let allWeapons = [];
  let allSkins = [];
  let allBuddies = [];
  let isLoaded = false;
  let activeModalItem = null;
  let filteredItems = [];

  // Initialize
  init();

  async function init() {
    setupEventListeners();
    await loadData();
  }

  function setupEventListeners() {
    // Category Tabs
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-collection-tab');
        
        // Show weapon filter only on 'skins' or 'all'
        if (weaponFilterContainer) {
          weaponFilterContainer.style.display = (currentCategory === 'skins' || currentCategory === 'all') ? 'block' : 'none';
        }

        currentPage = 1;
        applyFiltersAndRender();
      });
    });

    // Search input
    let searchDebounce;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
          currentSearch = e.target.value.trim().toLowerCase();
          if (clearSearchBtn) {
            clearSearchBtn.style.display = currentSearch ? 'inline-block' : 'none';
          }
          currentPage = 1;
          applyFiltersAndRender();
        }, 180);
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        currentSearch = '';
        clearSearchBtn.style.display = 'none';
        currentPage = 1;
        applyFiltersAndRender();
      });
    }

    // Sort select
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        currentPage = 1;
        applyFiltersAndRender();
      });
    }

    // Weapon filter select
    if (weaponFilterSelect) {
      weaponFilterSelect.addEventListener('change', (e) => {
        currentWeapon = e.target.value;
        currentPage = 1;
        applyFiltersAndRender();
      });
    }

    // Favorites only toggle
    if (favoritesToggleBtn) {
      favoritesToggleBtn.addEventListener('click', () => {
        showFavoritesOnly = !showFavoritesOnly;
        favoritesToggleBtn.classList.toggle('active', showFavoritesOnly);
        currentPage = 1;
        applyFiltersAndRender();
      });
    }

    // Jump to page
    if (jumpToPageBtn && jumpToPageInput) {
      jumpToPageBtn.addEventListener('click', handleJumpToPage);
      jumpToPageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleJumpToPage();
        }
      });
    }

    // Modal favorite button
    if (modalFavBtn) {
      modalFavBtn.addEventListener('click', () => {
        if (!activeModalItem) return;
        const isNowFav = Storage.toggleCosmeticFavorite(activeModalItem);
        updateModalFavButton(isNowFav);
        // Sync card heart icon in grid
        const cardHeart = document.querySelector(`.collection-fav-btn[data-uuid="${activeModalItem.uuid}"]`);
        if (cardHeart) {
          cardHeart.classList.toggle('active', isNowFav);
          cardHeart.innerHTML = isNowFav ? '<i class="bi bi-heart-fill"></i>' : '<i class="bi bi-heart"></i>';
        }
        if (showFavoritesOnly) {
          applyFiltersAndRender();
        }
      });
    }

    // Copy UUID in modal
    const copyUuidBtn = document.getElementById('copyModalUuidBtn');
    if (copyUuidBtn) {
      copyUuidBtn.addEventListener('click', () => {
        if (!activeModalItem || !activeModalItem.uuid) return;
        navigator.clipboard.writeText(activeModalItem.uuid).then(() => {
          Components.showToast('UUID copied to clipboard!', 'Copied');
        }).catch(() => {
          Components.showToast(activeModalItem.uuid, 'Item UUID');
        });
      });
    }

    // Listen for storage events
    window.addEventListener('cosmeticFavoritesUpdated', () => {
      if (showFavoritesOnly) {
        applyFiltersAndRender();
      }
    });
  }

  function handleJumpToPage() {
    if (!jumpToPageInput) return;
    const targetPage = parseInt(jumpToPageInput.value, 10);
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
    if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
      goToPage(targetPage);
    } else {
      jumpToPageInput.value = currentPage;
    }
  }

  /**
   * Load data from all 4 endpoints in parallel
   */
  async function loadData() {
    showLoading(true);
    showError(false);

    try {
      const [cardsRes, spraysRes, weaponsRes, buddiesRes] = await Promise.all([
        Api.getPlayerCards(),
        Api.getSprays(),
        Api.getWeapons(),
        Api.getBuddies()
      ]);

      if (!cardsRes.success && !spraysRes.success && !weaponsRes.success && !buddiesRes.success) {
        throw new Error('Failed to load collections from VALORANT API');
      }

      // Process Player Cards
      allCards = (cardsRes.data || []).map(c => ({
        uuid: c.uuid,
        displayName: c.displayName,
        displayIcon: c.displayIcon,
        largeArt: c.largeArt || c.displayIcon,
        wideArt: c.wideArt || '',
        smallArt: c.smallArt || '',
        type: 'card',
        typeName: 'Player Card',
        extra: c.themeUuid ? 'Themed' : 'Standard'
      }));

      // Process Sprays
      allSprays = (spraysRes.data || []).map(s => {
        const cat = s.category ? s.category.replace('EAresSprayCategory::', '') : 'Spray';
        return {
          uuid: s.uuid,
          displayName: s.displayName,
          displayIcon: s.fullTransparentIcon || s.displayIcon || s.fullIcon,
          fullIcon: s.fullIcon || s.displayIcon,
          animationGif: s.animationGif || '',
          animationPng: s.animationPng || '',
          isAnimated: !!(s.animationGif || s.animationPng),
          category: cat,
          type: 'spray',
          typeName: 'Spray',
          extra: cat
        };
      });

      // Process Weapons & Flatten Skins
      allWeapons = weaponsRes.data || [];
      allSkins = [];
      const weaponNames = new Set();

      allWeapons.forEach(w => {
        weaponNames.add(w.displayName);
        if (Array.isArray(w.skins)) {
          w.skins.forEach(s => {
            if (s.displayIcon) {
              allSkins.push({
                uuid: s.uuid,
                displayName: s.displayName,
                displayIcon: s.displayIcon,
                wallpaper: s.wallpaper || '',
                weaponName: w.displayName,
                weaponCategory: w.category ? w.category.replace('EEquippableCategory::', '') : 'Weapon',
                chromas: s.chromas || [],
                levels: s.levels || [],
                type: 'skin',
                typeName: 'Weapon Skin',
                extra: w.displayName
              });
            }
          });
        }
      });

      // Process Buddies
      allBuddies = (buddiesRes.data || []).map(b => ({
        uuid: b.uuid,
        displayName: b.displayName,
        displayIcon: b.displayIcon,
        levels: b.levels || [],
        type: 'buddy',
        typeName: 'Gun Buddy',
        extra: `${(b.levels || []).length} Level${(b.levels || []).length > 1 ? 's' : ''}`
      }));

      // Populate Weapon Filter Dropdown
      if (weaponFilterSelect) {
        const sortedWeapons = Array.from(weaponNames).sort((a, b) => a.localeCompare(b));
        sortedWeapons.forEach(name => {
          const opt = document.createElement('option');
          opt.value = name;
          opt.textContent = name;
          weaponFilterSelect.appendChild(opt);
        });
      }

      // Update Dynamic Header Statistics
      updateStats();

      // Update Tab Badges
      updateTabBadges();

      isLoaded = true;
      showLoading(false);

      // Render items
      applyFiltersAndRender();

    } catch (err) {
      console.error('Error loading collections:', err);
      showLoading(false);
      showError(true, err.message);
    }
  }

  function updateStats() {
    if (statCardsEl) statCardsEl.textContent = allCards.length.toLocaleString();
    if (statSpraysEl) statSpraysEl.textContent = allSprays.length.toLocaleString();
    if (statSkinsEl) statSkinsEl.textContent = allSkins.length.toLocaleString();
    if (statBuddiesEl) statBuddiesEl.textContent = allBuddies.length.toLocaleString();
  }

  function updateTabBadges() {
    const totalAll = allCards.length + allSprays.length + allSkins.length + allBuddies.length;
    const badgeAll = document.getElementById('badgeTabAll');
    const badgeCards = document.getElementById('badgeTabCards');
    const badgeSprays = document.getElementById('badgeTabSprays');
    const badgeSkins = document.getElementById('badgeTabSkins');
    const badgeBuddies = document.getElementById('badgeTabBuddies');

    if (badgeAll) badgeAll.textContent = totalAll.toLocaleString();
    if (badgeCards) badgeCards.textContent = allCards.length.toLocaleString();
    if (badgeSprays) badgeSprays.textContent = allSprays.length.toLocaleString();
    if (badgeSkins) badgeSkins.textContent = allSkins.length.toLocaleString();
    if (badgeBuddies) badgeBuddies.textContent = allBuddies.length.toLocaleString();
  }

  /**
   * Filter and sort active items list
   */
  function applyFiltersAndRender() {
    if (!isLoaded) return;

    // 1. Select source dataset by category
    let source = [];
    if (currentCategory === 'all') {
      source = [...allCards, ...allSprays, ...allSkins, ...allBuddies];
    } else if (currentCategory === 'cards') {
      source = allCards;
    } else if (currentCategory === 'sprays') {
      source = allSprays;
    } else if (currentCategory === 'skins') {
      source = allSkins;
    } else if (currentCategory === 'buddies') {
      source = allBuddies;
    }

    // 2. Weapon filter (for skins or all)
    if (currentWeapon !== 'all') {
      source = source.filter(item => item.weaponName === currentWeapon);
    }

    // 3. Search text filter
    if (currentSearch) {
      source = source.filter(item => 
        (item.displayName && item.displayName.toLowerCase().includes(currentSearch)) ||
        (item.extra && item.extra.toLowerCase().includes(currentSearch))
      );
    }

    // 4. Favorites only filter
    if (showFavoritesOnly) {
      source = source.filter(item => Storage.isCosmeticFavorite(item.uuid));
    }

    // 5. Sorting
    source.sort((a, b) => {
      const nameA = a.displayName || '';
      const nameB = b.displayName || '';
      if (currentSort === 'desc') {
        return nameB.localeCompare(nameA);
      }
      return nameA.localeCompare(nameB);
    });

    filteredItems = source;
    currentPage = 1;
    renderCurrentPage();
  }

  /**
   * Render cards for the current pagination state (20 items)
   */
  function renderCurrentPage() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    const total = filteredItems.length;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

    // Boundary check
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, total);
    const visibleStart = total > 0 ? startIndex + 1 : 0;
    const visibleEnd = endIndex;

    // Update Counter Text in Toolbar
    if (galleryCountEl) {
      let catName = 'Items';
      if (currentCategory === 'cards') catName = 'Player Cards';
      else if (currentCategory === 'sprays') catName = 'Sprays';
      else if (currentCategory === 'skins') catName = 'Weapon Skins';
      else if (currentCategory === 'buddies') catName = 'Gun Buddies';

      galleryCountEl.textContent = total > 0 
        ? `Showing ${visibleStart}–${visibleEnd} of ${total.toLocaleString()} ${catName} (Page ${currentPage} of ${totalPages})`
        : `0 ${catName} found`;
    }

    // Empty State
    if (total === 0) {
      if (paginationContainer) paginationContainer.style.display = 'none';
      galleryGrid.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="empty-state-box p-5 border border-archive rounded-3 bg-archive-card text-center">
            <i class="bi bi-search display-3 text-archive-muted mb-3 d-block"></i>
            <h3 class="font-heading fs-2 text-white mb-2">NO ITEMS FOUND</h3>
            <p class="text-archive-secondary mb-4">No cosmetic items match your current search or active filters.</p>
            <button class="btn btn-archive-primary" id="resetFiltersBtn">Reset Filters</button>
          </div>
        </div>
      `;
      const resetBtn = document.getElementById('resetFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          currentSearch = '';
          if (clearSearchBtn) clearSearchBtn.style.display = 'none';
          if (weaponFilterSelect) weaponFilterSelect.value = 'all';
          currentWeapon = 'all';
          if (favoritesToggleBtn) {
            showFavoritesOnly = false;
            favoritesToggleBtn.classList.remove('active');
          }
          applyFiltersAndRender();
        });
      }
      return;
    }

    // Render items slice (exact 20 items per page)
    const itemsToRender = filteredItems.slice(startIndex, endIndex);
    const fragment = document.createDocumentFragment();

    itemsToRender.forEach(item => {
      const cardEl = createCollectionCard(item);
      fragment.appendChild(cardEl);
    });

    galleryGrid.appendChild(fragment);

    // Render Pagination Controls
    renderPagination(total, totalPages, visibleStart, visibleEnd);
  }

  /**
   * Render Pagination Navigation
   */
  function renderPagination(total, totalPages, visibleStart, visibleEnd) {
    if (!paginationContainer || !paginationList) return;

    if (total <= ITEMS_PER_PAGE) {
      paginationContainer.style.display = 'none';
      return;
    }

    paginationContainer.style.display = 'block';

    // Update info text
    if (paginationInfo) {
      paginationInfo.textContent = `Showing ${visibleStart}–${visibleEnd} of ${total.toLocaleString()} items (Page ${currentPage} of ${totalPages})`;
    }

    // Update Jump to input max & value
    if (jumpToPageInput) {
      jumpToPageInput.max = totalPages;
      jumpToPageInput.value = currentPage;
    }

    // Build pagination list
    let html = '';

    // First button
    html += `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#collectionToolbar" data-page="1" aria-label="First Page" title="First Page">
          <i class="bi bi-chevron-double-left"></i>
        </a>
      </li>
    `;

    // Previous button
    html += `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#collectionToolbar" data-page="${currentPage - 1}" aria-label="Previous Page" title="Previous Page">
          <i class="bi bi-chevron-left"></i>
        </a>
      </li>
    `;

    // Smart numbered buttons with ellipsis
    const maxPagesToShow = 7;
    let startPage, endPage;

    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 4) {
        startPage = 1;
        endPage = 5;
      } else if (currentPage + 3 >= totalPages) {
        startPage = totalPages - 4;
        endPage = totalPages;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }

    // Ellipsis at start
    if (startPage > 1) {
      html += `
        <li class="page-item">
          <a class="page-link" href="#collectionToolbar" data-page="1">1</a>
        </li>
      `;
      if (startPage > 2) {
        html += `<li class="page-ellipsis">...</li>`;
      }
    }

    // Page range
    for (let p = startPage; p <= endPage; p++) {
      html += `
        <li class="page-item ${p === currentPage ? 'active' : ''}">
          <a class="page-link" href="#collectionToolbar" data-page="${p}">${p}</a>
        </li>
      `;
    }

    // Ellipsis at end
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        html += `<li class="page-ellipsis">...</li>`;
      }
      html += `
        <li class="page-item">
          <a class="page-link" href="#collectionToolbar" data-page="${totalPages}">${totalPages}</a>
        </li>
      `;
    }

    // Next button
    html += `
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#collectionToolbar" data-page="${currentPage + 1}" aria-label="Next Page" title="Next Page">
          <i class="bi bi-chevron-right"></i>
        </a>
      </li>
    `;

    // Last button
    html += `
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#collectionToolbar" data-page="${totalPages}" aria-label="Last Page" title="Last Page">
          <i class="bi bi-chevron-double-right"></i>
        </a>
      </li>
    `;

    paginationList.innerHTML = html;

    // Attach click listeners to page links
    const pageLinks = paginationList.querySelectorAll('.page-link');
    pageLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const p = parseInt(link.getAttribute('data-page'), 10);
        if (!isNaN(p) && p !== currentPage && p >= 1 && p <= totalPages) {
          goToPage(p);
        }
      });
    });
  }

  function goToPage(pageNum) {
    currentPage = pageNum;
    renderCurrentPage();

    // Smooth scroll to top of collection section
    const target = document.getElementById('collectionToolbar');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Create an individual collection card element
   */
  function createCollectionCard(item) {
    const isFav = Storage.isCosmeticFavorite(item.uuid);
    const col = document.createElement('div');

    // Layout column size depending on category
    if (item.type === 'card') {
      col.className = 'col-6 col-sm-4 col-md-3 col-lg-3 col-xl-custom mb-3';
    } else if (item.type === 'skin') {
      col.className = 'col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 mb-3';
    } else {
      col.className = 'col-6 col-sm-4 col-md-3 col-lg-3 col-xl-custom mb-3';
    }

    let typeBadgeClass = 'badge-card';
    if (item.type === 'spray') typeBadgeClass = 'badge-spray';
    else if (item.type === 'skin') typeBadgeClass = 'badge-skin';
    else if (item.type === 'buddy') typeBadgeClass = 'badge-buddy';

    // Image URL priority
    let imgSrc = item.displayIcon;
    if (item.type === 'card' && item.largeArt) imgSrc = item.largeArt;

    col.innerHTML = `
      <div class="collection-item-card h-100 ${item.type}-card" data-uuid="${Components.escapeHtml(item.uuid)}">
        <!-- Favorite Heart -->
        <button class="collection-fav-btn ${isFav ? 'active' : ''}" 
                data-uuid="${Components.escapeHtml(item.uuid)}" 
                title="${isFav ? 'Remove from favorites' : 'Add to favorites'}" 
                aria-label="Favorite">
          <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
        </button>

        <!-- Animated badge for sprays -->
        ${item.isAnimated ? '<span class="collection-animated-badge"><i class="bi bi-play-circle-fill me-1"></i>GIF</span>' : ''}

        <!-- Card Image Wrapper -->
        <div class="collection-img-wrap ${item.type}-img-wrap">
          <img src="${Components.escapeHtml(imgSrc)}" 
               alt="${Components.escapeHtml(item.displayName)}" 
               loading="lazy" 
               class="collection-img img-fluid"
               onerror="this.src='assets/img/placeholder-ability.svg'">
        </div>

        <!-- Card Details -->
        <div class="collection-card-body">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <span class="collection-type-badge ${typeBadgeClass}">${Components.escapeHtml(item.typeName)}</span>
            ${item.chromas && item.chromas.length > 1 ? `<span class="collection-chromas-pill"><i class="bi bi-palette me-1"></i>${item.chromas.length}</span>` : ''}
          </div>
          <h4 class="collection-item-title text-truncate" title="${Components.escapeHtml(item.displayName)}">
            ${Components.escapeHtml(item.displayName)}
          </h4>
          <p class="collection-item-extra text-truncate mb-0">
            ${Components.escapeHtml(item.extra || '')}
          </p>
        </div>
      </div>
    `;

    // Click on Card opens Preview Modal
    const cardBody = col.querySelector('.collection-item-card');
    cardBody.addEventListener('click', (e) => {
      if (e.target.closest('.collection-fav-btn')) return;
      openPreviewModal(item);
    });

    // Favorite heart click
    const favBtn = col.querySelector('.collection-fav-btn');
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isNowFav = Storage.toggleCosmeticFavorite(item);
      favBtn.classList.toggle('active', isNowFav);
      favBtn.innerHTML = isNowFav ? '<i class="bi bi-heart-fill"></i>' : '<i class="bi bi-heart"></i>';
      favBtn.title = isNowFav ? 'Remove from favorites' : 'Add to favorites';
      if (showFavoritesOnly) {
        applyFiltersAndRender();
      }
    });

    return col;
  }

  /**
   * Open the detailed item modal
   */
  function openPreviewModal(item) {
    if (!bsModal) return;
    activeModalItem = item;

    // Set Title and Type
    if (modalTitle) modalTitle.textContent = item.displayName;
    if (modalType) {
      modalType.textContent = item.typeName.toUpperCase();
      modalType.className = `badge collection-type-badge ${item.type === 'spray' ? 'badge-spray' : item.type === 'skin' ? 'badge-skin' : item.type === 'buddy' ? 'badge-buddy' : 'badge-card'}`;
    }

    // Set UUID
    if (modalUuid) modalUuid.textContent = item.uuid;

    // Image Setup
    let mainImgSrc = item.displayIcon;
    if (item.type === 'card' && item.largeArt) {
      mainImgSrc = item.largeArt;
    } else if (item.type === 'spray' && item.animationGif) {
      mainImgSrc = item.animationGif;
    } else if (item.type === 'spray' && item.fullIcon) {
      mainImgSrc = item.fullIcon;
    }

    if (modalImg) {
      modalImg.src = mainImgSrc;
      modalImg.alt = item.displayName;
      modalImg.className = `img-fluid modal-preview-img ${item.type}-modal-img`;
    }

    // Extra Info
    if (modalExtraInfo) {
      let infoHtml = '';
      if (item.type === 'card') {
        infoHtml = `
          <div class="row g-2 text-start mt-2">
            <div class="col-6"><span class="text-archive-muted small">Category:</span> <span class="text-white fw-medium">Player Card</span></div>
            <div class="col-6"><span class="text-archive-muted small">Edition:</span> <span class="text-white fw-medium">${Components.escapeHtml(item.extra)}</span></div>
          </div>
        `;
      } else if (item.type === 'spray') {
        infoHtml = `
          <div class="row g-2 text-start mt-2">
            <div class="col-6"><span class="text-archive-muted small">Category:</span> <span class="text-white fw-medium">${Components.escapeHtml(item.category)}</span></div>
            <div class="col-6"><span class="text-archive-muted small">Animated:</span> <span class="text-white fw-medium">${item.isAnimated ? '<span class="text-success"><i class="bi bi-check-circle-fill me-1"></i>Yes</span>' : 'Static'}</span></div>
          </div>
        `;
      } else if (item.type === 'skin') {
        infoHtml = `
          <div class="row g-2 text-start mt-2">
            <div class="col-6"><span class="text-archive-muted small">Weapon:</span> <span class="text-white fw-medium">${Components.escapeHtml(item.weaponName)}</span></div>
            <div class="col-6"><span class="text-archive-muted small">Category:</span> <span class="text-white fw-medium">${Components.escapeHtml(item.weaponCategory)}</span></div>
          </div>
        `;
      } else if (item.type === 'buddy') {
        infoHtml = `
          <div class="row g-2 text-start mt-2">
            <div class="col-6"><span class="text-archive-muted small">Type:</span> <span class="text-white fw-medium">Gun Buddy</span></div>
            <div class="col-6"><span class="text-archive-muted small">Levels:</span> <span class="text-white fw-medium">${Components.escapeHtml(item.extra)}</span></div>
          </div>
        `;
      }
      modalExtraInfo.innerHTML = infoHtml;
    }

    // Chromas / Color variants selector for skins
    if (modalChromasContainer) {
      if (item.type === 'skin' && item.chromas && item.chromas.length > 1) {
        let chromasHtml = `
          <div class="chromas-selector mt-3 text-start">
            <label class="form-label text-archive-muted small text-uppercase mb-2">Available Variants (${item.chromas.length})</label>
            <div class="d-flex flex-wrap gap-2">
        `;
        item.chromas.forEach((chroma, idx) => {
          chromasHtml += `
            <button class="btn btn-sm btn-archive-secondary chroma-pill ${idx === 0 ? 'active' : ''}" 
                    data-chroma-img="${Components.escapeHtml(chroma.displayIcon || item.displayIcon)}"
                    data-chroma-name="${Components.escapeHtml(chroma.displayName || item.displayName)}">
              ${chroma.swatch ? `<img src="${Components.escapeHtml(chroma.swatch)}" alt="swatch" class="chroma-swatch me-1">` : ''}
              <span>${Components.escapeHtml(chroma.displayName || `Variant ${idx + 1}`)}</span>
            </button>
          `;
        });
        chromasHtml += `</div></div>`;
        modalChromasContainer.innerHTML = chromasHtml;
        modalChromasContainer.style.display = 'block';

        // Add click events to switch preview image
        const pills = modalChromasContainer.querySelectorAll('.chroma-pill');
        pills.forEach(pill => {
          pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const targetImg = pill.getAttribute('data-chroma-img');
            if (modalImg && targetImg) {
              modalImg.src = targetImg;
            }
          });
        });
      } else {
        modalChromasContainer.innerHTML = '';
        modalChromasContainer.style.display = 'none';
      }
    }

    // Sync Favorite Button in modal
    const isFav = Storage.isCosmeticFavorite(item.uuid);
    updateModalFavButton(isFav);

    bsModal.show();
  }

  function updateModalFavButton(isFav) {
    if (!modalFavBtn) return;
    if (isFav) {
      modalFavBtn.className = 'btn btn-archive-primary';
      modalFavBtn.innerHTML = '<i class="bi bi-heart-fill me-1"></i> Favorited';
    } else {
      modalFavBtn.className = 'btn btn-archive-secondary';
      modalFavBtn.innerHTML = '<i class="bi bi-heart me-1"></i> Add to Favorites';
    }
  }

  function showLoading(show) {
    if (galleryLoading) galleryLoading.style.display = show ? 'block' : 'none';
    if (galleryGrid) galleryGrid.style.display = show ? 'none' : 'flex';
  }

  function showError(show, message = '') {
    if (galleryError) {
      galleryError.style.display = show ? 'block' : 'none';
      if (show) {
        galleryError.innerHTML = `
          <div class="empty-state-box p-5 border border-archive rounded-3 bg-archive-card text-center">
            <i class="bi bi-exclamation-triangle-fill display-3 text-archive-red mb-3 d-block"></i>
            <h3 class="font-heading fs-2 text-white mb-2">FAILED TO LOAD COLLECTIONS</h3>
            <p class="text-archive-secondary mb-4">${Components.escapeHtml(message || 'Unable to connect to the VALORANT API.')}</p>
            <button class="btn btn-archive-primary" id="retryCollectionsBtn">Try Again</button>
          </div>
        `;
        const retry = document.getElementById('retryCollectionsBtn');
        if (retry) {
          retry.addEventListener('click', () => loadData());
        }
      }
    }
  }
});
