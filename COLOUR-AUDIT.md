# Colour Audit — adambarnes.biz

A reference of every colour used across the site: the value, the variable/class
it lives in, which pages use it, and what it is applied to. Report only, no code
changes. Generated 2026-07-04, updated 2026-07-05 (SEO & GEO now has its own accent).

Colours are defined as CSS custom properties in `public/css/main.css`. Each page
sets a `bodyClass` (in its `<Base>` call) which can override `--accent`.

---

## A. Core palette (`:root` variables)

| Swatch | Hex | Variable | Applied to | Where used |
|---|---|---|---|---|
| ⬛ | `#0C0C0C` | `--black` | Body text (light mode), page background (dark mode), `btn-cta` rest fill, dark CTA cards | Every page |
| ⬜ | `#F7F5F0` | `--white` | Page background (light mode), body text (dark mode), button ink | Every page |
| 🟧 | `#FF5500` | `--orange` (root value) | Nav link hover, hero "orange" word, accent on pages that do not override it | Home + any non-webdesign page |
| 🟩 | `#AAFF00` | `--green` | Photography accent, gallery titles, hero title accent | Photography (+ Firstlight case study) |
| 🟨 | `#FFD600` | `--yellow` | Clients accent | Clients |
| 🟪 | `#8833FF` | `--purple` | About / Privacy accent | About, Privacy |
| 🟦 | `#00b4ff` | `--blue` | FAQ + Blog accent, and the general link-hover colour (`cs-copy p a:hover`, `post__body a:hover`) | FAQ, Blog, links site-wide |
| 🩷 | `#FF2E88` | `--accent` (via `page-seogeo`) | SEO & GEO accent: hero title, headings, quote border, button/card hover, back-to-top, FAQ open/hover state | SEO & GEO only |

---

## B. Per-page accent mapping (`--accent`)

Each page's `bodyClass` sets `--accent` (and `--accent-ink`, the text colour that
sits on the accent).

| Page(s) | bodyClass | `--accent` | ink (`--accent-ink`) |
|---|---|---|---|
| **Web Design**, most case studies | `page-webdesign` | **`#fc9803`** (redefines `--orange`) | `#000` |
| **SEO & GEO** | `page-seogeo` | **`#FF2E88`** magenta | `#000` |
| Photography (+ Firstlight case study) | `page-photography` | `#AAFF00` green | `#000` |
| Clients | `page-clients` | `#FFD600` yellow | `#000` |
| About, Privacy | `page-about` | `#8833FF` purple | `#fff` |
| **FAQ** | `page-faq` | `#00b4ff` blue | `#000` |
| **Blog (Thinking)** | `page-blog` | `#00b4ff` blue | `#000` |
| Home | `page-home` | no override → root `--orange` `#FF5500` | — |
| Contact | `page-contact` | no override → root `--orange` `#FF5500` | — |

**What `--accent` drives:** `section-title .accent`, `cs-copy-heading`,
`cs-quote` left border, `btn-cta` hover fill, `client-card` hover / touched state,
back-to-top button.

---

## C. Base background & text

| Mode | Background | Text |
|---|---|---|
| Light | `#F7F5F0` (`--white`) | `#0C0C0C` (`--black`) |
| Dark | `#0C0C0C` (`--black`) | `#F7F5F0` (`--white`) |

Light and dark simply swap black and white.

**Muted / utility colours (alpha over black or white):**

- Body prose (muted): `rgba(0,0,0,0.55)` to `rgba(0,0,0,0.62)` light; `rgba(255,255,255,0.55–0.62)` dark
- Hairline borders: `rgba(0,0,0,0.1)` light; `rgba(255,255,255,0.1)` dark
- Client-card grid greys (7-step cycle): `#F8F6F1`, `#F0EEE9`, `#F6F4EF`, `#EEECE7`, `#F4F2ED`, `#ECEAE5`, `#F2F0EB`

---

## D. Shared accents (flagged)

1. **FAQ and Blog (Thinking) share the same blue accent** (`#00b4ff`). If they
   should be distinct, it is a small `bodyClass` / `--accent` change per page.

**Resolved:** Web Design and SEO & GEO previously shared the orange accent. SEO &
GEO now has its own magenta (`page-seogeo`, `#FF2E88`), so that pair is no longer
shared. Web Design and the `page-webdesign` case studies still share `#fc9803`.

---

## E. Notes and inconsistencies

- **Two different "oranges".** Root `--orange` is `#FF5500` (bright red-orange,
  used on Home nav hover and the hero word), but `page-webdesign` redefines
  `--orange` to `#fc9803` (a softer amber). So the brand orange is not one value.
- **Two photography greens.** Accent and titles use `#AAFF00`, but
  `cs-copy-heading` on the Photography page uses a deeper lime `#99E600` in light
  mode (reverts to `#AAFF00` in dark mode).
- **Ink flips.** Every accent pairs with black ink except About / Privacy
  (purple), which uses white ink for legibility.
- **`page-seogeo` mirrors `page-webdesign` for cards.** SEO & GEO uses the same
  client-card / grid styling as Web Design, so `page-seogeo` is added as a twin
  alongside every `page-webdesign` card selector in `main.css`; only the accent
  (and the FAQ open/hover colour) differ. If you edit a `page-webdesign` card
  rule, add the `page-seogeo` twin too.

---

*This is a local reference file. It lives in the repo root but is not part of the
built site (only `src/pages` and `public/` are served), so it will not appear on
adambarnes.biz.*
