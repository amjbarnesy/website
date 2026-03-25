/* ============================================================
   ADAM BARNES — WEBRANDESIGN
   main.js — GSAP Animations & Interactions
   ============================================================ */

'use strict';

/* ── GSAP Setup ─────────────────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* ── Utilities ──────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Custom Cursor ──────────────────────────────────────────── */
(function initCursor() {
  const cursor = $('#cursor');
  if (!cursor) return;

  let mouseX = 0, mouseY = 0;
  let curX = 0, curY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth follow with RAF
  (function loop() {
    curX += (mouseX - curX) * 0.12;
    curY += (mouseY - curY) * 0.12;
    gsap.set(cursor, { x: curX, y: curY });
    requestAnimationFrame(loop);
  })();

  // Expand on interactive elements
  const hoverEls = $$('a, button, .client-card, .photo-item, .teaser, .btn, .btn-submit');
  hoverEls.forEach(el => {
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

  btn.addEventListener('click', () => {
    open = !open;
    btn.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on nav link click (with page transition)
  $$('.menu-nav a', overlay).forEach(link => {
    link.addEventListener('click', () => {
      open = false;
      btn.classList.remove('open');
      overlay.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && open) btn.click();
  });
})();

/* ── Page Transitions ───────────────────────────────────────── */
(function initPageTransitions() {
  const overlay = $('#page-transition');
  if (!overlay) return;

  // Animate in on page load
  gsap.fromTo(overlay,
    { yPercent: 0 },
    { yPercent: -100, duration: 0.8, ease: 'power3.inOut', delay: 0.1 }
  );

  // Intercept internal link clicks
  $$('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // Only internal .html links
    if (!href || href.startsWith('http') || href.startsWith('mailto') ||
        href.startsWith('tel') || href.startsWith('#')) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      gsap.fromTo(overlay,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 0.6,
          ease: 'power3.inOut',
          onComplete: () => { window.location.href = href; }
        }
      );
    });
  });
})();

/* ── Hero Animations (index.html only) ─────────────────────── */
(function initHero() {
  const lineInners = $$('.line-inner');
  if (!lineInners.length) return;

  // Stagger the three lines of hero text in
  gsap.to(lineInners, {
    y: 0,
    duration: 1.1,
    ease: 'power4.out',
    stagger: 0.12,
    delay: 0.5
  });

  // Animate the three horizontal lines
  const lines = $$('.hero-lines span');
  gsap.to(lines, {
    scaleX: 1,
    duration: 1.2,
    ease: 'power4.out',
    stagger: 0.1,
    delay: 1.1
  });

  // Cycle the coloured middle word
  initWordCycle();
})();

function initWordCycle() {
  const words = $$('.hero-word-swap .word');
  if (!words.length) return;

  let current = 0;
  const total = words.length;

  // Word swap with GSAP
  function swapTo(nextIndex) {
    const curr = words[current];
    const next = words[nextIndex];

    // Animate current out (up)
    gsap.to(curr, {
      y: '-110%',
      opacity: 0,
      duration: 0.6,
      ease: 'power3.in',
      onComplete: () => {
        curr.classList.remove('active');
        gsap.set(curr, { y: '110%', opacity: 1 });
      }
    });

    // Animate next in (from below)
    gsap.fromTo(next,
      { y: '110%', opacity: 1 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.1,
        onStart: () => next.classList.add('active')
      }
    );

    current = nextIndex;
  }

  // Start cycling after initial load animation
  let wordIndex = 0;
  setTimeout(() => {
    setInterval(() => {
      wordIndex = (wordIndex + 1) % total;
      swapTo(wordIndex);
    }, 2200);
  }, 2000);
}

/* ── Section Header Animation ───────────────────────────────── */
(function initSectionHeader() {
  const header = $('.section-header');
  if (!header) return;

  const title  = $('.section-title', header);
  const intro  = $('.section-intro', header);

  if (title) {
    gsap.fromTo(title,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power4.out', delay: 0.3 }
    );
  }
  if (intro) {
    gsap.fromTo(intro,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power4.out', delay: 0.55 }
    );
  }
})();

/* ── Scroll Reveal ──────────────────────────────────────────── */
(function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings that appear together
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
})();

/* ── Contact Form ───────────────────────────────────────────── */
(function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    const btn = form.querySelector('.btn-submit');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    // Form submits normally via mailto: or your chosen backend
    // For Formspree / Netlify, remove the action attr and handle here with fetch
  });
})();

/* ── Marquee / Smooth scroll ────────────────────────────────── */
(function initSmoothScroll() {
  // Lerped scroll for ultra-smooth feel (lightweight, no library needed)
  // Only applies if user hasn't opted for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let currentY = 0;
  let targetY  = 0;
  let running  = false;
  const ease   = 0.1;

  window.addEventListener('scroll', () => {
    targetY = window.scrollY;
    if (!running) {
      running = true;
      tick();
    }
  }, { passive: true });

  function tick() {
    currentY += (targetY - currentY) * ease;
    if (Math.abs(targetY - currentY) < 0.5) {
      running = false;
      return;
    }
    requestAnimationFrame(tick);
  }
})();

/* ── Client Card — cursor label ─────────────────────────────── */
(function initClientCards() {
  const cards = $$('.client-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      document.getElementById('cursor')?.classList.add('big');
    });
    card.addEventListener('mouseleave', () => {
      document.getElementById('cursor')?.classList.remove('big');
    });
  });
})();
