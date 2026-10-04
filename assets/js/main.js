/* =========================================================
   HEADER / NAVBAR
   ========================================================= */
(() => {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  const nav = header.querySelector('[data-nav]');
  const toggle = header.querySelector('[data-nav-toggle]');
  const dropdownToggles = header.querySelectorAll('[data-dropdown-toggle]');
  const mobile = window.matchMedia('(max-width: 1023px)');

  // Shadow once the page scrolls
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Dropdowns: click/keyboard on desktop, accordion on mobile
  const closeDropdowns = (except) => {
    dropdownToggles.forEach((btn) => {
      if (btn === except) return;
      btn.setAttribute('aria-expanded', 'false');
      btn.parentElement.classList.remove('is-open');
    });
  };

  dropdownToggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      closeDropdowns(btn);
      btn.setAttribute('aria-expanded', String(open));
      btn.parentElement.classList.toggle('is-open', open);
    });

    btn.parentElement.addEventListener('focusout', (e) => {
      if (!mobile.matches && !btn.parentElement.contains(e.relatedTarget)) closeDropdowns();
    });
  });

  // Mobile menu
  const isMenuOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  const setMenu = (open) => {
    if (open) nav.style.setProperty('--nav-top', `${header.getBoundingClientRect().bottom}px`);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('nav-open', open);
    if (!open) closeDropdowns();
  };

  toggle.addEventListener('click', () => setMenu(!isMenuOpen()));

  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav__item--dropdown') && !mobile.matches) closeDropdowns();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isMenuOpen()) {
        setMenu(false);
        toggle.focus();
        return;
      }
      const openBtn = header.querySelector('[data-dropdown-toggle][aria-expanded="true"]');
      if (openBtn) {
        closeDropdowns();
        openBtn.focus();
      }
      return;
    }

    // Keep keyboard focus inside the open mobile menu
    if (e.key === 'Tab' && isMenuOpen()) {
      const items = [toggle, ...nav.querySelectorAll('a[href], button')]
        .filter((el) => el.getClientRects().length > 0);
      const i = items.indexOf(document.activeElement);
      e.preventDefault();
      items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
    }
  });

  mobile.addEventListener('change', () => setMenu(false));
})();
