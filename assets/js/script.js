document.addEventListener('DOMContentLoaded', function () {

  const nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        nav.style.padding = '6px 0';
        nav.style.boxShadow = '0 2px 14px rgba(0,0,0,0.12)';
      } else {
        nav.style.padding = '';
        nav.style.boxShadow = '';
      }
    });
  }

  const navLinks = document.querySelectorAll('#navMenu .nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const collapse = document.getElementById('navMenu');
      if (collapse && window.bootstrap) {
        const bsCollapse = bootstrap.Collapse.getInstance(collapse);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });

  const darkToggle = document.getElementById('darkToggle');
  const icon = darkToggle ? darkToggle.querySelector('i') : null;

  function applyTheme(isDark) {
    if (isDark) {
      document.body.classList.add('dark');
      if (icon) icon.className = 'bi bi-sun-fill';
    } else {
      document.body.classList.remove('dark');
      if (icon) icon.className = 'bi bi-moon-fill';
    }
  }

  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('theme');
  } catch (e) {}

  let isDark = savedTheme ? savedTheme === 'dark' : true;
  applyTheme(isDark);

  if (darkToggle) {
    darkToggle.addEventListener('click', () => {
      isDark = !isDark;
      applyTheme(isDark);
      try {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      } catch (e) {}
    });
  }

  const fadeEls = document.querySelectorAll('.fade-in-up');
  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    fadeEls.forEach(el => observer.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  const hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty('--mouse-x', `${x}%`);
      hero.style.setProperty('--mouse-y', `${y}%`);
    });
  }

  // 3D Glass Tilt & Dynamic Specular Lighting Motion
  const glassCards = document.querySelectorAll('.project-glass-card[data-tilt]');
  glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Subtle tilt angle (-5deg to +5deg)
      const rotateX = ((y - centerY) / centerY) * -5.5;
      const rotateY = ((x - centerX) / centerX) * 5.5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;

      const glow = card.querySelector('.card-glass-glow');
      if (glow) {
        glow.style.background = `radial-gradient(circle 280px at ${x}px ${y}px, rgba(255, 255, 255, 0.16), transparent 70%)`;
        glow.style.opacity = '1';
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      const glow = card.querySelector('.card-glass-glow');
      if (glow) {
        glow.style.opacity = '0';
      }
    });
  });

});
