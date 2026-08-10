# Portfolio — Frontend Angular Consultant

A premium freelance portfolio: Angular 22, standalone, zoneless, signals-first,
server-rendered and prerendered, with a hardened Node/Nodemailer contact backend.

---

## Before you launch

All copy lives in
[`src/app/core/config/portfolio.content.ts`](src/app/core/config/portfolio.content.ts)
and is sourced from the live site at <https://www.rabinr.in> — profile, stats,
five real projects, three roles, six services, skills, process, education and
certifications. Nothing there is invented.

Still needs you:

| What                 | Where                                                    |
| -------------------- | -------------------------------------------------------- |
| Case-study narrative | `PROJECTS[*].caseStudy` — sections marked `[EXPAND]`      |
| Zellavora screenshots| No product stills supplied; the card falls back to a desk photo |
| Résumé PDF           | `public/media/resume/rabin-r-cv.pdf` — referenced but absent |

### About the media

Mobile screenshots get their own treatment. Tall phone portraits dropped into a
landscape card stretch it, and a 16:9 case-study hero crops them to a status
bar — so `tools/compose-mobile-shots.mjs` arranges the *real* screenshots on a
dark canvas to produce the VNPF card and hero, and the gallery uses
`fit: 'contain'` with a fixed `displayAspect` so each screen is letterboxed
whole. Re-run the tool after replacing any phone screenshot.

Project screenshots are the genuine article — 29 real captures across the two
Fiji immigration systems, PRIMS, VNPF and InsureMet, each with alt text written
from the actual screen. Section photography comes from `public/media/working`
and is served as WebP at several widths with a JPEG fallback.

**The videos are not recordings of your work.** All eight files in
`public/media/videos` are AI-generated stock footage carrying a generator
watermark, and none of them show the system they are named after —
`fiji-internal.mp4` is a dark abstract dashboard with garbled text, nothing like
the real light-blue government UI. They are therefore used only:

- on case studies, behind an explicit "Concept motion piece — an illustrative
  visualisation, not a recording of the delivered system" caption; and
- as `decorative` ambience in the Process section, hidden from assistive tech.

Delete them from `SITE_MEDIA` and the projects' `preview` fields if you would
rather not run them at all. Real screen recordings would beat both options.

**Unreferenced files** still shipping in `public/`: `media/my_working_img/`
(30 WhatsApp photos, 4MB) and `media/blog/` (7 SVGs, for an Insights section
that does not exist). Everything in `public/` is publicly reachable once
deployed — delete what you do not intend to publish.

Two smaller `[VERIFY]` markers: `resumeUpdated` (set it to the date of the PDF
you upload) and the Zellavora `liveUrl` (currently pointing at your homepage).

**On the metrics.** Your site states 40% fewer API calls, 50% better
performance and 10,000+ users across three countries at the *ITGalax role*
level. They are attached here to the flagship Fiji internal platform, since
per-project attribution isn't published. Move or restate them if that's wrong —
they're the strongest claims on the site and should be the most precise.

`TESTIMONIALS` is deliberately empty. The section renders nothing until real
quotes exist — an absent section reads better than an invented endorsement.

---

## Running it

```bash
npm install                # web app
npm --prefix server install  # contact API

npm start                  # web app on :4200 (proxies /api → :3333)
npm run server:dev         # contact API on :3333
```

Copy `server/.env.example` to `server/.env` and fill in SMTP credentials first —
the API refuses to start in production without a working transport.

### Scripts

| Command                | Does                                                     |
| ---------------------- | -------------------------------------------------------- |
| `npm start`            | Dev server with API proxy                                |
| `npm run build`        | Regenerates the sitemap, then builds + prerenders         |
| `npm run serve:ssr`    | Runs the built SSR server                                 |
| `npm test`             | Unit tests (Vitest)                                       |
| `npm run test:e2e`     | Playwright, 4 projects, against the **production build**   |
| `npm run lint`         | ESLint                                                    |
| `npm run format`       | Prettier                                                  |
| `npm run server:build` | Compiles the contact API                                  |

---

## Architecture

```
src/app/
  core/           services, models, content config     — no UI
    config/       portfolio.content.ts (all site copy)
    models/       typed domain contracts
    services/     portfolio-store, seo, motion, device-capability, contact-api
  shared/         reusable components + directives     — no business logic
  layout/         header, footer
  features/       home (+ sections), work, project-detail, resume, contact, not-found
server/           Express + Nodemailer contact API
e2e/              Playwright specs
```

**State** is signals, everywhere. `PortfolioStore` seeds signals from a static
content module; swapping it for an API means replacing that seed with
`resource()` and changing nothing downstream.

**RxJS** appears in exactly two places: the router event stream in the header,
and the HTTP call in `ContactApi`. Both are genuinely asynchronous streams. The
stream stops at the component boundary — components hold signals.

### Motion

`Motion` dynamically imports GSAP + ScrollTrigger, once, in the browser, and
returns `null` when animation is disabled. That makes "no motion" the easy path
at every call site instead of something each component must remember to check.

`DeviceCapability` is the single authority on how much work a device should do:

| Signal                 | Gates                                        |
| ---------------------- | -------------------------------------------- |
| `animationsEnabled`    | reveals, parallax, counters, magnetic buttons |
| `webglEnabled`         | the Three.js hero field (stricter: also off on mobile, low memory/cores, save-data) |
| `customCursorEnabled`  | the custom cursor                             |

Every animated element is authored in its **final** state in CSS. The "from"
state is applied only after GSAP loads, so server-rendered and reduced-motion
users can never see a flash of hidden content — the classic failure mode of
scroll reveals.

### Known browser workarounds

Two are load-bearing and documented in place:

- Animating `clip-path: circle()` on the full-screen mobile menu **crashes
  WebKit**. The menu uses a transform + opacity reveal instead.
- Capturing that menu in a router view transition also crashes WebKit;
  `onViewTransitionCreated` skips the transition while the menu is open.

Both were found by the Playwright suite, which is why it runs mobile Safari.

---

## Contact backend

```
Angular form → POST /api/contact → validate → rate limit → honeypot
             → sanitize → Nodemailer → SMTP → your inbox
```

- **Validation** — Zod, server-side, restating every client rule.
- **Rate limiting** — per IP, configurable window and ceiling; returns 429.
- **Honeypot** — a hidden `website` field. A filled one gets a *success*
  response: telling a bot it was detected only teaches its author.
- **Sanitisation** — HTML escaped in the email body; CR/LF stripped from
  anything reaching a header, so no SMTP header injection.
- **Payload ceiling** — 32kb.
- **CORS** — explicit origin allowlist.
- **Errors** — SMTP failures are logged server-side and never returned; the
  client sees a message safe to show a stranger.

Credentials live only in `server/.env`. Nothing SMTP-related is ever bundled
into the Angular app.

### Deploying

Run both processes behind one origin so `/api` is same-origin:

```nginx
location /api/ { proxy_pass http://127.0.0.1:3333; }
location /     { proxy_pass http://127.0.0.1:4000; }
```

Set `ALLOWED_ORIGINS` to your production origin and add your hostname to
`angular.json` → `security.allowedHosts` (Angular's SSRF protection rejects
unknown `Host` headers).

---

## Accessibility

Targets WCAG 2.2 AA and is verified in CI:

- One `h1` per page, ordered headings, real landmarks.
- Every image carries `alt`, `width` and `height` — no layout shift.
- Visible focus everywhere; a skip link is the first tab stop.
- `prefers-reduced-motion` disables WebGL, parallax, reveals and the cursor,
  and keeps the design intact.
- Form errors are tied to inputs with `aria-describedby`; results announce
  through a polite live region without stealing focus.
- The custom cursor never replaces a real one on touch or coarse pointers.

---

## Performance

- Every route is lazy; GSAP and Three.js are dynamic imports.
- All 10 routes prerender, including one page per project.
- Hydration with event replay.
- Images: explicit dimensions, lazy by default, `fetchpriority="high"` on the
  first fold. Swap the placeholder SVGs for AVIF/WebP via
  `PortfolioMedia.sources` when real assets land.
- Video downloads nothing but a poster until it nears the viewport, and pauses
  when it leaves.
- The WebGL field caps DPR at 1.75 and stops rendering in a background tab.

## Testing

- **Unit** (Vitest): content invariants, structured data, and the server's
  validation and sanitisation rules.
- **E2E** (Playwright): 29 specs × 4 projects — Chromium, Firefox, mobile
  Safari, and a dedicated reduced-motion project. Runs against the real SSR
  build, not the dev server.
