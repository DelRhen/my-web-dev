/**
 * navigation.js - Navigation behavior & favorites counter sync
 */
document.addEventListener('DOMContentLoaded', () => {
  // Update favorite badge counters
  const updateFavoriteBadges = () => {
    const count = Storage.getFavorites().length;
    const badges = document.querySelectorAll('.fav-badge');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    });
  };

  // Sync active nav item
  const syncActiveNav = () => {
    const path = window.location.pathname;
    const navLinks = document.querySelectorAll('.archive-nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      const cleanHref = href.split('?')[0].split('#')[0];
      const cleanPath = path.substring(path.lastIndexOf('/') + 1);

      if (cleanHref === cleanPath || 
          (cleanHref === 'index.html' && (cleanPath === '' || cleanPath === '/')) ||
          (cleanHref === 'agents.html' && cleanPath === 'agent.html') ||
          (cleanHref === 'maps.html' && cleanPath === 'map.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  const offcanvasEl = document.getElementById('archiveNavbarOffcanvas');
  const togglers = document.querySelectorAll('.navbar-toggler');
  
  if (offcanvasEl && offcanvasEl.parentElement !== document.body) {
    document.body.appendChild(offcanvasEl);
  }

  const openOffcanvas = () => {
    if (!offcanvasEl) return;
    if (typeof bootstrap !== 'undefined' && bootstrap.Offcanvas) {
      try {
        const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
        bsOffcanvas.show();
        return;
      } catch (err) {}
    }
    offcanvasEl.classList.add('show');
    document.body.classList.add('offcanvas-open');
    let backdrop = document.querySelector('.archive-offcanvas-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'archive-offcanvas-backdrop fade show';
      backdrop.addEventListener('click', closeOffcanvas);
      document.body.appendChild(backdrop);
    }
  };

  const closeOffcanvas = () => {
    if (!offcanvasEl) return;
    if (typeof bootstrap !== 'undefined' && bootstrap.Offcanvas) {
      try {
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
        if (bsOffcanvas) {
          bsOffcanvas.hide();
        }
      } catch (err) {}
    }
    offcanvasEl.classList.remove('show');
    document.body.classList.remove('offcanvas-open');
    const backdrop = document.querySelector('.archive-offcanvas-backdrop');
    if (backdrop) backdrop.remove();
  };

  togglers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isShown = offcanvasEl.classList.contains('show');
      if (isShown) {
        closeOffcanvas();
      } else {
        openOffcanvas();
      }
    });
  });

  if (offcanvasEl) {
    const links = offcanvasEl.querySelectorAll('.archive-nav-link');
    links.forEach(link => {
      link.addEventListener('click', closeOffcanvas);
    });

    const closeBtn = offcanvasEl.querySelector('[data-bs-dismiss="offcanvas"]');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeOffcanvas();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && offcanvasEl.classList.contains('show')) {
        closeOffcanvas();
      }
    });
  }

  // Initial badge and link setup
  updateFavoriteBadges();
  syncActiveNav();

  // Listen for storage events (both custom and cross-tab storage events)
  window.addEventListener('favoritesUpdated', updateFavoriteBadges);
  window.addEventListener('storage', (e) => {
    if (e.key === 'valorant_archive_favorites') {
      updateFavoriteBadges();
    }
  });
});
