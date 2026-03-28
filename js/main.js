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
    curX += (mouseX - curX) * 0.12;
    curY += (mouseY - curY) * 0.12;
    cursor.style.left = curX + 'px';
    cursor.style.top  = curY + 'px';
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
})();

/* ── Hero Animations (index.html only) ─────────────────────── */
(function initHero() {
  const heroText = $('.hero-text');
  if (!heroText) return;

  // Animate lines in from below — fromTo() explicitly sets start AND end
  // onComplete removes overflow:hidden from lines so tall words aren't clipped
  gsap.fromTo('.hero-text .line-inner',
    { y: '110%' },
    { y: '0%', duration: 1.0, ease: 'power4.out', stagger: 0.1, delay: 0.8 }
  );

  // Animated horizontal lines
  gsap.fromTo('.hero-lines span',
    { scaleX: 0 },
    { scaleX: 1, transformOrigin: 'left center', duration: 1.0, ease: 'power4.out', stagger: 0.08, delay: 1.05 }
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

/* ── Contact Form ───────────────────────────────────────────── */
(function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  form.addEventListener('submit', () => {
    const btn = form.querySelector('.btn-submit');
    if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
  });
})();
