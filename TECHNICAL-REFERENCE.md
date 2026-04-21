# Technical Reference — Adam Barnes Website

A complete build reference for this site. Use this to rebuild, extend, or build something similar from scratch.

---

## Stack at a Glance

| Concern | Solution |
|---|---|
| HTML | Vanilla, semantic, 14 static pages |
| CSS | Single file `css/main.css` (~2,020 lines), no framework |
| JS | Single file `js/main.js` (~320 lines), vanilla + GSAP |
| Animations | GSAP 3.12.5 (CDN) + IntersectionObserver |
| Fonts | Google Fonts: Jost + Space Grotesk |
| Lightbox | GLightbox (photography pages) |
| Analytics | Google Analytics (G-0TJ8ENE0WB) |
| Contact backend | `contact.php` (honeypot spam protection) |
| Hosting | Static files (no build step, no bundler) |

---

## File Structure

```
website/
├── index.html
├── web-design.html
├── photography.html
├── clients.html
├── about.html
├── contact.html
├── faq.html
├── privacy.html
├── case-study-firstlight-festival.html
├── case-study-domarn-group.html
├── case-study-uk-director-magazine.html
├── case-study-boat-hire-norwich.html
├── case-study-gardner-denley.html
├── case-study-macro-advisory.html
├── contact.php
├── sitemap.xml
├── css/
│   └── main.css
├── js/
│   └── main.js
└── assets/
    ├── logo.svg
    ├── favicon.svg
    ├── adam-portrait.png
    ├── adam-portrait-smile.png
    ├── og-image.jpg
    ├── logos/          ← client logos (SVG, PNG, WebP)
    ├── photography/    ← 7+ category subfolders
    ├── casestudies/    ← per-project images
    └── images/         ← misc
```

---

## CSS Architecture

### Variables (`:root`)

```css
:root {
  /* Colors */
  --black:  #0C0C0C;
  --white:  #F7F5F0;
  --orange: #FF5500;
  --green:  #AAFF00;
  --yellow: #FFD600;
  --purple: #8833FF;
  --blue:   #00b4ff;

  /* Typography */
  --font-display: 'Jost', sans-serif;     /* headings, nav, UI */
  --font-body: 'Space Grotesk', sans-serif; /* body, forms */

  /* Animation */
  --ease:    cubic-bezier(0.16, 1, 0.3, 1);   /* snappy out */
  --ease-io: cubic-bezier(0.76, 0, 0.24, 1);  /* in-out */
  --dur:     0.7s;
}
```

### Per-Page Accent Colours

Each page has a `body` class that sets `--accent` and overrides the `.section-title .accent` colour:

```css
body.page-webdesign   { --accent: var(--orange); }
body.page-photography { --accent: var(--green); }
body.page-clients     { --accent: var(--yellow); }
body.page-about       { --accent: var(--purple); }
body.page-faq         { --accent: var(--blue); }
```

The contact page is permanently dark (hardcoded `background: var(--black)`), no accent needed.

### Typography Scale

All headings use `clamp()` for fluid sizing — no breakpoint overrides needed:

```css
.hero-text        { font-size: clamp(3rem, 9vw, 7.5rem); }
.section-title    { font-size: clamp(2.5rem, 7vw, 6rem); }
.gallery-title    { font-size: clamp(1.6rem, 3.5vw, 2.8rem); }
.contact-quote    { font-size: clamp(2.5rem, 7vw, 6rem); }
.menu-nav a       { font-size: clamp(1.2rem, 4.2vh, 4.2rem); }
```

Body copy: `--font-body`, line-height 1.7–1.75. Labels/nav: uppercase, letter-spacing 0.08–0.15em.

### Responsive Breakpoints

| Breakpoint | What changes |
|---|---|
| `769px+` | Desktop nav visible, hamburger hidden |
| `≤768px` | Desktop nav hidden, hamburger visible, nav theme btn hidden |
| `≤900px` | 3-col grids → 2-col; gallery masonry columns reduce |
| `≤800px` | Section header spacing, back-to-top button |
| `≤700px` | Testimonial block reflows to single column |
| `≤600px` | Most grids collapse to 1 col; padding reduces to 1.5rem |
| `landscape + max-height: 500px` | Desktop nav shown, hamburger/overlay hidden (phone landscape) |

Padding rhythm: `3rem` desktop → `2rem` at 900px → `1.5rem` at 600px.

---

## Navigation

### Desktop (≥769px)

Fixed `<nav>` with logo left, links centre-right, theme icon far right. Links styled as small-caps (0.7rem, letter-spacing 0.12em). Active link gets `opacity: 1` (inactive is 0.55). Each link has a per-colour hover rule:

```css
.nav-links a[href="web-design.html"]:hover  { color: var(--orange); }
.nav-links a[href="photography.html"]:hover { color: var(--green); }
.nav-links a[href="clients.html"]:hover     { color: var(--yellow); }
.nav-links a[href="about.html"]:hover       { color: var(--purple); }
.nav-links a[href="faq.html"]:hover         { color: var(--blue); }
```

### Mobile Full-Screen Menu (≤768px)

The menu overlay (`#menu-overlay`) is a fixed `position: fixed; inset: 0` div with `background: var(--black)`. It reveals via a `clip-path` animation:

```css
.menu-overlay        { clip-path: inset(0 0 100% 0); transition: clip-path 0.8s var(--ease); }
.menu-overlay.open   { clip-path: inset(0 0 0% 0); }
```

Each menu link text is wrapped in a `<span>` that starts off-screen (`translateY(110%)`) and slides in with staggered delays when the overlay opens:

```css
.menu-nav a span                  { transform: translateY(110%); transition: transform 0.7s var(--ease); }
.menu-overlay.open .menu-nav a span { transform: translateY(0); }
.menu-nav a:nth-child(1) span     { transition-delay: 0.05s; }
/* …up to nth-child(7) at 0.35s */
```

Links are left-aligned (`align-items: flex-start`, `padding-left: 3rem`), weight 300, large clamp size. **Important:** `.menu-nav a` must not have `width: 100%` or `text-align: center` or they override the flex alignment.

Hover colours in mobile menu use `data-page` attributes:
```css
.menu-nav a[data-page="web-design"]:hover  { color: var(--orange); }
.menu-nav a[data-page="photography"]:hover { color: var(--green); }
.menu-nav a[data-page="clients"]:hover     { color: var(--yellow); }
.menu-nav a[data-page="about"]:hover       { color: var(--purple); }
.menu-nav a[data-page="faq"]:hover         { color: var(--blue); }
.menu-nav a:hover { color: rgba(255,255,255,0.5); } /* home + contact fallback */
```

The menu footer contains contact details and social links, absolutely positioned at the bottom.

### Mobile Landscape Override

When a phone is in landscape (short screen), the full-screen menu is hidden entirely and the desktop nav is shown instead:

```css
@media (orientation: landscape) and (max-height: 500px) {
  .nav-links       { display: flex; }
  .nav-theme-btn   { display: flex; }
  .hamburger       { display: none; }
  .menu-overlay    { display: none !important; }
}
```

A `matchMedia` listener in JS auto-closes the menu (and restores `body.overflow`) if it was open when the phone rotated.

---

## Dark Mode

**Detection & storage:**

```js
const saved = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (saved === 'dark' || (saved === null && prefersDark)) {
  document.documentElement.setAttribute('data-theme', 'dark');
}
```

This runs inline in `<head>` before first paint to prevent flash.

**CSS selector:** All dark overrides use `html[data-theme="dark"] .component { … }`.

**Toggle controls:** Two entry points — a button in the desktop nav (`#nav-theme-btn` with sun/moon SVGs toggled by opacity), and a checkbox toggle inside the mobile menu. Both are synced in JS.

**Contact page** is always dark regardless of theme (`body.page-contact` hardcodes black bg, white text).

---

## Animation System

### Page Transitions

A black `div.page-transition` covers the entire screen. On navigation: slides in from below (yPercent 100→0, 0.6s), then on the next page load slides off upward (yPercent 0→-100, 0.9s). Intercepts all internal `<a>` clicks. Handles back-forward cache with the `pageshow` event.

### Hero Animations (homepage only)

Runs on DOMContentLoaded via GSAP:

1. Hero text lines: `fromTo` with `y: '110%' → 0`, stagger 0.1s, starts at 0.8s delay
2. Portrait: `opacity 0→1, y 16→0`, delay 0.9s
3. Tagline: `opacity 0→1, y 12→0`, delay 1.1s
4. After 2.5s: word-cycle begins

**Word cycle:** Rotates through "Creative / Web Design / Photography / Clients / Thinking" every 2.6s. Each swap: GSAP fades out (`opacity 0, y -20`) → updates text + class → fades in (`opacity 0→1, y 20→0`). The current word has a colour class matching its accent.

### Scroll Reveal

All elements with class `.reveal` are watched by an `IntersectionObserver` (threshold 0.07, rootMargin `-30px`). When triggered, a 55ms stagger is applied per element and `.visible` is added:

```css
.reveal         { opacity: 0; transform: translateY(30px); transition: opacity 0.8s var(--ease), transform 0.8s var(--ease); }
.reveal.visible { opacity: 1; transform: none; }
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .reveal { opacity: 1; transform: none; }
  .cursor, .page-transition { display: none; }
}
```

---

## Custom Cursor

A 14px circle (`.cursor`) follows the mouse with damping (12% lerp per frame via `requestAnimationFrame`). On hover of interactive elements it gains class `.big` (scales to 64px, blend mode changes). On the contact page and in the lightbox it switches to white with `mix-blend-mode: screen`.

Only activates on pointer-fine devices. Touch devices get no cursor element at all.

---

## FAQ Accordion

The expand/collapse uses a CSS Grid trick — no JavaScript needed for the animation:

```css
.faq-answer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s var(--ease);
}
.faq-item.open .faq-answer { grid-template-rows: 1fr; }
.faq-answer-inner { overflow: hidden; }
```

The inner wrapper needs `overflow: hidden` to clip content during the `0fr` collapsed state. The outer `.faq-answer` must be `display: grid` for the row animation to work.

JavaScript toggles the `.open` class and enforces one-open-at-a-time:

```js
items.forEach(item => {
  item.querySelector('.faq-question').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    items.forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});
```

The FAQ page uses two explicit `<div class="faq-col">` wrappers in a 2-column grid rather than CSS `columns:` property — this ensures each column's accordion works independently (CSS columns would split items mid-accordion).

### Schema Markup

Every FAQ page includes `FAQPage` JSON-LD in `<head>` for Google rich results:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "…",
    "acceptedAnswer": { "@type": "Answer", "text": "…" }
  }]
}
```

---

## Photography Gallery

Uses CSS `columns: 3` (Masonry-style) with `break-inside: avoid` on each item. Aspect ratios cycle via `:nth-child` (4/3, 3/4, 1/1) to create visual variety without manual sizing.

Images are wrapped as GLightbox anchors — clicking opens a full-screen lightbox. The lightbox body state is `body.lightbox-open` which triggers the white cursor.

Gallery sections are navigated by anchor links in a sticky `.gallery-nav` bar. JS handles smooth scroll accounting for nav height.

---

## Client Cards

CSS Grid with three variants:

```css
.clients-grid                    { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
.clients-grid--two               { grid-template-columns: repeat(2, 1fr); }
.clients-grid--three             { grid-template-columns: repeat(3, 1fr); }

@media (max-width: 900px) { .clients-grid--three { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .clients-grid--three { grid-template-columns: 1fr; } }
```

Cards have a `.client-more` overlay (position absolute, opacity 0) that reveals extended content on click. Auto-collapses after 5 seconds via `setTimeout`. `aria-expanded` and `aria-hidden` are toggled for accessibility.

---

## Contact Form

HTML form posts to `contact.php`. Fields: Name, Email, Phone (optional), Subject (optional), Message, plus a hidden honeypot field (`name="website"`, `class="form-hp"`, `tabindex="-1"`).

**Floating label pattern (pure CSS):**

```css
.form-label {
  position: absolute;
  top: 1rem; left: 0;
  transition: top 0.2s, font-size 0.2s;
}
.form-input:focus + .form-label,
.form-input:not(:placeholder-shown) + .form-label {
  top: -0.5rem;
  font-size: 0.65rem;
  letter-spacing: 0.1em;
}
```

The input uses `placeholder=" "` (a space) to make `:not(:placeholder-shown)` trigger when it has a real value.

---

## Case Study Pages

Each case study uses a shared layout:

- `.cs-header` — 2-column grid: text left, featured image right
- `.cs-header-logo` — client logo, constrained width with wide-logo variant
- `.cs-section` — alternating content sections
- `.cs-gallery` — image grid for project screenshots

Dark mode logo inversion (for black SVG logos on white):
```css
html[data-theme="dark"] .cs-header-logo-img { filter: brightness(0) invert(1); }
```

---

## SEO & Meta

Every page has:
- `<title>` and `<meta name="description">`
- `<link rel="canonical">`
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`)
- Twitter Card tags
- Page-specific JSON-LD structured data (`WebPage`, `CollectionPage`, `FAQPage`, `Person`, etc.)
- `sitemap.xml` listing all 14 pages with priorities

---

## Performance Notes

- No build step — files served as-is
- GSAP loaded from CDN (CloudFlare), deferred with `<script src>` at end of body
- Google Fonts loaded via CSS `@import` in main.css (consider `<link rel=preconnect>` + `<link rel=stylesheet>` in `<head>` for faster load)
- Images not lazy-loaded by default — add `loading="lazy"` to below-fold images for large pages
- Custom cursor is hidden on touch devices via `(pointer: coarse)` media query — no JS overhead on mobile
- `display: none` on hidden elements avoids layout cost vs `visibility: hidden`

---

## How to Rebuild Something Similar

### Minimum HTML template per page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title</title>
  <link rel="stylesheet" href="css/main.css">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <!-- Dark mode pre-apply (prevents flash) -->
  <script>!function(){var s=localStorage.getItem('theme'),p=window.matchMedia('(prefers-color-scheme:dark)').matches;if(s==='dark'||(s===null&&p))document.documentElement.setAttribute('data-theme','dark')}()</script>
</head>
<body class="page-[name]">
  <div class="cursor" id="cursor"></div>
  <div class="page-transition" id="page-transition"></div>
  <nav><!-- logo, nav-links, nav-theme-btn, hamburger --></nav>
  <div class="menu-overlay" id="menu-overlay"><!-- mobile menu --></div>
  <main><!-- content --></main>
  <footer><!-- footer --></footer>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

### Adding a new accent colour for a new page

1. Add a CSS variable to `:root`: `--teal: #00c9a7;`
2. Add a body class rule: `body.page-newpage { --accent: var(--teal); }`
3. Add nav hover: `.nav-links a[href="newpage.html"]:hover { color: var(--teal); }`
4. Add mobile menu hover: `.menu-nav a[data-page="newpage"]:hover { color: var(--teal); }`
5. Add the nav link to all pages (desktop nav + mobile overlay)
6. Add to `sitemap.xml`

### Adding a new case study

1. Duplicate an existing case study HTML file
2. Update all meta tags (title, description, canonical, OG, JSON-LD)
3. Add a card to `clients.html` with a link to the new case study
4. Add the URL to `sitemap.xml`
5. Put the client logo in `assets/logos/`

### Adding a new FAQ question

1. Add a new `.faq-item` block in `faq.html` inside one of the two `.faq-col` divs
2. Add the matching `Question`/`acceptedAnswer` entry to the `FAQPage` JSON-LD in `<head>`

---

## Known Patterns to Watch

- **Edit tool anchor strings:** When editing HTML files with inline styles or `class="active"` variants, the Edit tool requires an exact string match — use the most specific unique surrounding context
- **Mobile menu links need `<span>` wrappers** for the slide-in animation to work
- **`display: none` vs `visibility: hidden`:** This codebase uses `display: none` to hide things, so adding anything back requires explicitly setting `display: flex/grid/block`
- **FAQ accordion requires `display: grid` on `.faq-answer`** — switching to `display: flex` or `display: block` breaks the `grid-template-rows` animation
- **Dark mode logo inversion:** If a client logo SVG is black, use `filter: brightness(0) invert(1)` in dark mode rather than maintaining two separate image files
