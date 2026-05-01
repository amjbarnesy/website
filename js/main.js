/* ============================================================
   ADAM BARNES — WEBRANDESIGN
   main.js — GSAP Animations & Interactions
   ============================================================ */

'use strict';

gsap.registerPlugin(ScrollTrigger);

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Page Transition ────────────────────────────────────────── */
// Runs first — slide the black overlay UP to reveal the page
(function initPageTransition() {
  const overlay = $('#page-transition');
  if (!overlay) return;

  // Overlay starts off-screen below (set in CSS), we pull it up over page, then push it off above
  gsap.set(overlay, { yPercent: 0 }); // cover page immediately
  gsap.to(overlay, {
    yPercent: -100,
    duration: 0.9,
    ease: 'power3.inOut',
    delay: 0.05,
    onComplete: () => { overlay.style.display = 'none'; }
  });

  // Handle back-forward cache restore — re-run reveal if page was cached mid-transition
  window.addEventListener('pageshow', e => {
    if (e.persisted) {
      overlay.style.display = '';
      gsap.fromTo(overlay,
        { yPercent: 0 },
        { yPercent: -100, duration: 0.9, ease: 'power3.inOut', delay: 0.05,
          onComplete: () => { overlay.style.display = 'none'; }
        }
      );
    }
  });

  // Intercept internal link clicks — slide overlay back in then navigate
  $$('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto') ||
        href.startsWith('tel') || href.startsWith('#') ||
        link.classList.contains('glightbox')) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.style.display = '';
      gsap.fromTo(overlay,
        { yPercent: 100 },
        { yPercent: 0, duration: 0.6, ease: 'power3.inOut',
          onComplete: () => { window.location.href = href; }
        }
      );
    });
  });
})();

/* ── Custom Cursor ──────────────────────────────────────────── */
(function initCursor() {
  const cursor = $('#cursor');
  if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

  // Only hide the system cursor once the mouse has actually moved
  document.addEventListener('mousemove', e => {
    document.body.classList.add('has-mouse');
    mouseX = e.clientX; mouseY = e.clientY;
  }, { once: false });

  (function loop() {
    curX += (mouseX - curX) * 0.25;
    curY += (mouseY - curY) * 0.25;
    cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();

  $$('a, button, .client-card, .photo-item, .teaser, .btn, .btn-submit').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('big'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
  });
})();

/* ── Hamburger / Menu ───────────────────────────────────────── */
(function initMenu() {
  const btn     = $('#hamburger');
  const overlay = $('#menu-overlay');
  if (!btn || !overlay) return;

  let open = false;

  const toggle = () => {
    open = !open;
    btn.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  btn.addEventListener('click', toggle);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) toggle(); });

  // Close when a menu link is clicked
  $$('.menu-nav a', overlay).forEach(link => {
    link.addEventListener('click', () => {
      if (open) toggle();
    });
  });

  // Auto-close when rotating to landscape on mobile (menu hides via CSS, restore scroll)
  window.matchMedia('(orientation: landscape) and (max-height: 500px)').addEventListener('change', e => {
    if (e.matches && open) toggle();
  });
})();

/* ── Hero Animations (index.html only) ─────────────────────── */
(function initHero() {
  const heroText = $('.hero-text');
  if (!heroText) return;

  // Animate lines in from below — fromTo() explicitly sets start AND end
  // onComplete removes overflow:hidden from lines so tall words aren't clipped
  gsap.fromTo('.hero-text .line-inner',
    { y: '110%' },
    {
      y: '0%', duration: 1.0, ease: 'power4.out', stagger: 0.1, delay: 0.8,
      onComplete: () => {
        $$('.hero-text .line').forEach(el => { el.style.overflow = 'visible'; });
      }
    }
  );

  // Portrait fade in
  gsap.fromTo('#hero-portrait',
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out', delay: 0.9 }
  );

  // Tagline fade in
  gsap.fromTo('#hero-tagline',
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.1 }
  );
  gsap.fromTo('.hero-lets-talk',
    { opacity: 0, y: 8 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 1.5 }
  );

  // Word cycle — starts after hero finishes animating in
  setTimeout(initWordCycle, 2500);
})();

function initWordCycle() {
  const el = $('#word-swap-text');
  if (!el) return;

  const sequence = [
    { text: 'Creative',        cls: 'hero-word--ghost'  },
    { text: 'Web\u00a0Design', cls: 'hero-word--orange' },
    { text: 'Photography',     cls: 'hero-word--green'  },
    { text: 'Clients',         cls: 'hero-word--yellow' },
    { text: 'Thinking',        cls: 'hero-word--purple' },
  ];
  let current = 0;

  function next() {
    const nxt = sequence[(current + 1) % sequence.length];

    // Fade + lift out
    gsap.to(el, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        // Swap content while invisible
        el.textContent = nxt.text;
        el.className   = `word ${nxt.cls}`;
        current        = (current + 1) % sequence.length;
        // Fade + rise in from below
        gsap.fromTo(el,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
      }
    });
  }

  setInterval(next, 2600);
}

/* ── Section Header Animation (inner pages) ─────────────────── */
(function initSectionHeader() {
  if ($('.hero-text')) return; // skip on homepage

  gsap.from('.section-title', {
    y: 40, opacity: 0, duration: 1.0, ease: 'power4.out', delay: 0.6
  });
  gsap.from('.section-intro', {
    y: 25, opacity: 0, duration: 1.0, ease: 'power4.out', delay: 0.75
  });

})();

/* ── Scroll Reveal ──────────────────────────────────────────── */
(function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 55);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });

  items.forEach(el => io.observe(el));
})();

/* ── Gallery Section Anchors ────────────────────────────────── */
(function initGalleryNav() {
  const navLinks = $$('.gallery-nav a[href^="#"]');
  if (!navLinks.length) return;
  const siteNav = $('nav');

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      const navH = siteNav ? siteNav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── Client Read More ──────────────────────────────────────── */
(function initReadMore() {
  const COLLAPSE_DELAY = 5000;

  function collapseCard(card) {
    card.classList.remove('is-expanded');
    const overlay = card.querySelector('.client-more');
    const btn = card.querySelector('.btn-read-more');
    if (overlay) overlay.setAttribute('aria-hidden', 'true');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  document.querySelectorAll('.client-card').forEach(card => {
    let timer = null;

    card.addEventListener('mouseleave', () => {
      if (!card.classList.contains('is-expanded')) return;
      timer = setTimeout(() => collapseCard(card), COLLAPSE_DELAY);
    });

    card.addEventListener('mouseenter', () => {
      clearTimeout(timer);
      timer = null;
    });
  });

  document.querySelectorAll('.btn-read-more').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.client-card');
      const overlay = card.querySelector('.client-more');
      card.classList.add('is-expanded');
      overlay.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');
    });
  });

  document.querySelectorAll('.btn-read-less').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      collapseCard(btn.closest('.client-card'));
    });
  });
})();

/* ── Dark Mode Toggle ───────────────────────────────────────── */
(function initTheme() {
  const checkbox = document.getElementById('theme-toggle');
  const navBtn   = document.getElementById('nav-theme-btn');
  if (!checkbox && !navBtn) return;

  const isDark  = () => document.documentElement.getAttribute('data-theme') === 'dark';
  const setTheme = (dark) => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
    if (checkbox) checkbox.checked = dark;
  };

  if (checkbox) {
    checkbox.checked = isDark();
    checkbox.addEventListener('change', () => setTheme(checkbox.checked));
  }
  if (navBtn) navBtn.addEventListener('click', () => setTheme(!isDark()));
})();

/* ── Nav invert on dark sections ───────────────────────────── */
(function initNavInvert() {
  const nav   = $('nav');
  const proof = $('.ab-proof');
  if (!nav || !proof) return;

  let isOverDark = false;
  const html = document.documentElement;

  function update() {
    const inDarkMode = html.getAttribute('data-theme') === 'dark';
    nav.classList.toggle('nav--on-dark', isOverDark && !inDarkMode);
  }

  new IntersectionObserver(entries => {
    isOverDark = entries[0].isIntersecting;
    update();
  }, {
    rootMargin: `-${nav.offsetHeight}px 0px 0px 0px`,
    threshold: 0
  }).observe(proof);

  new MutationObserver(update).observe(html, { attributes: true, attributeFilter: ['data-theme'] });
})();

/* ── Contact Form ───────────────────────────────────────────── */
(function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  form.addEventListener('submit', () => {
    const btn = form.querySelector('.btn-submit');
    if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
  });
})();
