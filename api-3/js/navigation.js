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

      if (cleanHref === cleanPath || (cleanHref === 'index.html' && (cleanPath === '' || cleanPath === '/'))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  // Auto-close offcanvas on mobile link click
  const offcanvasEl = document.getElementById('archiveNavbarOffcanvas');
  if (offcanvasEl && typeof bootstrap !== 'undefined' && bootstrap.Offcanvas) {
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
    const links = offcanvasEl.querySelectorAll('.archive-nav-link');
    links.forEach(link => {
      link.addEventListener('click', () => {
        try {
          bsOffcanvas.hide();
        } catch (e) {}
      });
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
