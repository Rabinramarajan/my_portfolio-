# Media creative direction

Everything in `public/media/**` is currently a generated SVG placeholder. This
document is the brief for replacing them.

## Art direction

The imagery has one job: make the work look like something a serious company
paid for. That means **real interfaces, photographed as objects** — not
illustrations of software.

**Yes:** near-black backgrounds, a single cool light source, shallow depth of
field, real UI at real density, generous negative space, one accent colour per
project carried from `PortfolioProject.accent`.

**No:** floating 3D robots, glowing neon code rain, hooded figures, isometric
developer illustrations, stock-photo teams pointing at monitors, purple-to-pink
gradients, lens flare.

If an image would look at home in a SaaS template, it is wrong.

## Formats

Ship every raster asset as AVIF + WebP with a JPEG fallback, wired through
`PortfolioMedia.sources` (most-preferred first). Always set real `width` and
`height` — the layout reserves space from them.

| Asset      | Dimensions  | Notes                                    |
| ---------- | ----------- | ---------------------------------------- |
| Thumbnail  | 1200 × 900  | Card. Must read at 400px wide.           |
| Hero       | 1600 × 1000 | Case-study header, up to 78vh tall.      |
| UI shots   | 1600 × 1000 | Gallery.                                 |
| Mobile     | 800 × 1400  | One per project maximum.                 |
| OG image   | 1200 × 630  | Text must survive being scaled to a card.|
| Video      | 1920 × 1080 | MP4 (h.264) + WebM, ≤ 8s, ≤ 2MB, silent. |

Prefer a short silent MP4/WebM loop over an animated GIF everywhere — the
`<app-video-showcase>` component handles poster, lazy activation and pausing
off-screen. Use animated WebP only if a true image element is required.

---

## Per-project brief

For each project, produce: hero, thumbnail, two UI shots, one mobile shot, one
architecture diagram, one short video loop.

### Generation prompts

Substitute the project's own subject matter; keep the photographic language
identical so the set reads as one system.

**Hero**

> Editorial product photograph of a widescreen monitor displaying a dense
> dark-mode {SUBJECT} interface, shot three-quarter from the left, near-black
> studio background, single cool key light from the upper right, soft falloff,
> shallow depth of field, fine dust visible in the light, no text legible at
> small sizes, muted palette with a single {ACCENT} highlight, 35mm, f/2.0,
> photorealistic, no people

**Thumbnail**

> Tight crop of a dark-mode {SUBJECT} interface panel at a slight angle,
> near-black background, one soft cool light, high information density, calm
> composition with generous negative space on the left, single {ACCENT} accent,
> photorealistic UI, no illustration, no text overlay

**UI screenshot**

> Straight-on screenshot of a professional dark-mode {SUBJECT} application:
> data-dense tables, small precise typography, restrained borders, one {ACCENT}
> highlight colour, generous whitespace, no marketing copy, no logos, realistic
> product interface

**Mobile**

> Modern smartphone held in one hand against a dark neutral background,
> displaying a dark-mode {SUBJECT} interface designed for one-handed use, large
> touch targets, single cool light source, shallow depth of field, photorealistic

**Architecture diagram**

> Minimal technical architecture diagram on near-black, thin hairline strokes,
> monospaced labels, rectangular nodes and orthogonal connectors only, one
> {ACCENT} colour for the highlighted path, generous spacing, no icons, no
> gradients, no shadows — schematic and editorial, not decorative

**3D / abstract accent**

> Abstract soft-lit geometric form floating in near-black space, matte
> dielectric material, gentle subsurface glow in {ACCENT}, extremely shallow
> depth of field, minimal, sculptural, no text, no logo, studio product
> photography lighting

### Video concepts

- **Hero loop** — slow dolly across the running interface; no cuts.
- **Interaction loop** — one real interaction end to end: filter applied, chart
  redrawn, row expanded. Screen recording, cropped tight, 4–6s.
- **Case study** — the specific before/after the case study claims. If the
  claim is a latency improvement, show the two side by side.

Record at 2× and downscale: crisp small text is the whole point.

---

## Accessibility

`alt` describes what the image shows a *reader* who cannot see it, in the
context of the surrounding copy — "Order book and depth chart in the trading
desk", not "screenshot" or "dashboard image". Purely decorative media stays
decorative: the WebGL field and its fallback are already `aria-hidden`.
