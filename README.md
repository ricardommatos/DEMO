# PERIGEE — instruments for the night

A one-page concept site for a fictional maker of hand-built telescopes.
Fully static, zero build step — open `index.html` or serve the folder:

```sh
python3 -m http.server 8000
```

## How it was made

1. **Art direction** — following the `imagegen-frontend-web` skill, eight horizontal
   design references were generated, one per section, in a single locked brand world
   (deep ink, bone serif type, one amber accent). They live in `design/sections/`.
2. **Asset extraction** — every visual element in the comps (moon, telescope macros,
   brass dial, lens, star chart, observer, portraits, textures) was regenerated as a
   standalone image on a black field. They live in `assets/img/` and are the
   images actually used by the site.
3. **Recreation in code** — the comps were rebuilt as a real page with
   GSAP + ScrollTrigger + Lenis (vendored in `js/vendor/`, fonts self-hosted in
   `assets/fonts/` — the site has no external dependencies).

## Sections

| № | Section | Composition |
|---|---------|-------------|
| 1 | Hero | Full-bleed moonrise, bottom-left statement, parallax moon |
| 2 | Manifesto | Stacked-center statement, word-by-word scroll scrub |
| 3 | The Instrument | Editorial split — macro photo + numbered spec column |
| 4 | Optics | Gapless bento grid, clip-path reveals, rotating star chart |
| 5 | Field Notes | Full-bleed Milky Way, scrub-zoom background, pulsing waypoints |
| 6 | Voices | Paper material switch — cream quote sheet, duotone portraits |
| 7 | Editions | Three cards, featured amber edition, staggered entrance |
| 8 | Close | Floating crescent, giant serif close, single CTA + footer |

## Motion

Lenis smooth scrolling synced to the GSAP ticker, masked line-reveal headlines,
intro veil timeline, per-section parallax, magnetic buttons, a custom amber cursor,
animated film grain — all gated behind `prefers-reduced-motion` and fully
functional without JavaScript.
