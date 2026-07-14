# Header motion SVGs — production brief

How to make the animated SVGs that sit upper-right in the page headers on
adambarnes.biz. Give this file to whatever tool or Claude session generates
them. The deployed files live in `public/assets/<page>-background.svg` —
overwrite the file and the page updates; no code changes needed.

## The one-sentence brief

A small, quiet, **one-shot** line animation (~6 seconds) that tells the
page's story in abstract form and then settles into a composition that
works as a static graphic forever after.

## Canvas & placement

- `viewBox="0 0 640 420"` exactly. Never resize the canvas to fit the
  artwork — leave empty space empty.
- Root: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">`
- It renders as a CSS background, top-right of the hero, up to 720px wide
  on desktop, hidden on phones (≤600px). Long page headlines overlap its
  **left third** — keep the important marks in the right two-thirds, or
  accept the overlap deliberately.
- Self-contained only: no `<script>` (dead in background images), no
  external fonts/images/URLs.

## Timing — the 6-second rule

Visitors give the top of the page 3–4 seconds before they read or scroll.
The story must therefore **complete while they're still looking**:

- Total timeline: **5–7 seconds**, then stop. Nothing after that, ever.
- Structure (lines drawing, shapes forming): done by ~50% (≈3s).
- Accent payoff (the pop, the reveal, the dot arriving): lands at
  **55–70%** (≈3.5–4.5s). This is the moment most people should still see.
- Small stagger delays between elements (0.1–0.5s) are good.

## One-shot, never loop

- Every animation: `animation: name 6s ease-in-out forwards;`
  (**`forwards`, never `infinite`**).
- **No fade-out at the end of the timeline.** The last keyframe of every
  property must be the resolved, visible state — e.g. end on
  `52%,100%{opacity:.2; stroke-dashoffset:0}`, not a `90%,100%{opacity:0}`
  reset. If the timeline ends with everything at opacity 0, the page is
  left with a blank corner for the rest of the visit.
- Mid-story disappearances are fine (something can vanish *as part of the
  narrative*), but the final frame must be a deliberate composition —
  judge it as a still image, because that's what it is for 95% of the
  visit and every repeat visit.

## Colour

- Structure/ink: near-black `#0C0C0C` at low opacity (0.15–0.26), or grey
  `#b3b3b3` / `#C2C2C2` for secondary nodes. Keep it quiet.
- **One accent colour per artwork**, matching the page headline:

  | Page | File | Accent |
  |---|---|---|
  | Web Design | `web-design-background.svg` | `#FC9803` amber |
  | SEO & GEO | `seo-geo-background.svg` | `#FF2E88` magenta (NOT orange) |
  | Photography | `photography-background.svg` | `#AAFF00` lime |
  | Clients | `clients-background.svg` | `#FFD600` yellow |
  | About | `about-background.svg` | `#8833FF` purple |
  | FAQ | `faq-background.svg` | `#00B4FF` blue |
  | Thinking | `thinking-background.svg` | `#00B4FF` blue |

- Confine the accent to small marks (dots, short strokes, focus points) —
  it's the payoff, not the structure.

## Dark mode — important

- **Do NOT include `@media (prefers-color-scheme: dark)` blocks.** The
  site's dark mode is a manual toggle, not the OS setting; an OS-level
  switch inside the file fights the site and breaks both directions.
- The site handles dark mode by applying `filter: invert(1)
  hue-rotate(180deg)` to the artwork. Consequences for you:
  - Near-black ink comes back cream — automatic, no work needed.
  - Mid-lightness accents (amber, magenta, blue, purple) survive with
    roughly the right hue.
  - **Bright, light accents (yellow, lime) come back dark and muddy.**
    Prefer mid-lightness hues where there's a choice.
- **Escape hatch for bright accents:** a page can opt out of the filter
  with a second file, `<page>-background-dark.svg` — a copy with the ink
  swapped to its inverted value (`#0C0C0C` → `#F3F3F3`) and the accent
  left at its true colour — plus a CSS override (`filter: none` +
  `background-image` swap under `html[data-theme="dark"]`). Photography
  and Clients use this (Clients also swaps its node grey,
  `#C2C2C2` → `#3D3D3D`). **If the light artwork is re-exported, the dark
  variant must be regenerated from it** — it does not update itself.

## Accessibility & mechanics

- Line-drawing: use `pathLength="1"` with
  `stroke-dasharray:1; stroke-dashoffset:1` animating to 0 (or explicit
  dash lengths — both fine). Percent-based keyframes so duration changes
  are a one-number edit.
- Always include a reduced-motion block that jumps straight to the final
  state:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; }
    /* then set every element to its resolved state */
  }
  ```
- Keep files small: target under 4KB. No editor metadata, no base64.

## Checklist before delivery

- [ ] `viewBox="0 0 640 420"`
- [ ] Total timeline 5–7s, accent payoff by ~4.5s
- [ ] `forwards` everywhere, zero `infinite`
- [ ] Final frame is a deliberate, visible composition
- [ ] No `prefers-color-scheme` block; reduced-motion block present
- [ ] One accent, correct colour for the page (table above)
- [ ] No `<script>`, no external references
- [ ] Filename `<page>-background.svg`, dropped into `public/assets/`

## History (why these rules exist)

Every rule above was learned the hard way during the 2026-07-10→12 build:
looping animations distracted from reading; end-of-loop fades left blank
corners once converted to one-shot; OS dark-mode blocks fought the site
toggle; 12-second timelines finished after visitors had stopped watching;
yellow inverted to brown; earlier canvases came back a different size on
every export. Deviating from the brief re-fights those battles.