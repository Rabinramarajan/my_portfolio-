# E2E Testing

Playwright end-to-end tests for the portfolio. Quick reference — see
[playwright.config.ts](playwright.config.ts) and the specs under [e2e/](e2e/) for detail.

## Running locally

```bash
npm run e2e          # run the whole suite (all projects)
npm run e2e:ui       # interactive UI mode
npm run e2e:debug    # step-through debugger
npm run e2e:report   # open the last HTML report
```

The config's `webServer` starts `ng serve` automatically and **reuses** an
already-running dev server locally, so `npm start` in another terminal speeds things up.

Target a subset:

```bash
npx playwright test nav home --project=chromium   # by file + browser
npx playwright test --grep "Contact Form"         # by title
```

Projects: `chromium`, `firefox`, `webkit`, `mobile-chrome` (Pixel 5), `mobile-safari` (iPhone 13).

## Page Object Model

Specs live in [e2e/specs/](e2e/specs/); page objects in [e2e/pages/](e2e/pages/) (one class per
route, re-exported from `pages/index.ts`).

- **Locators**: prefer `getByRole` / `getByLabel` / `getByTestId` over CSS. Add a `data-testid`
  to a template only when no stable semantic selector exists.
- **`BasePage`** provides `navigateTo()`, `waitForPageReady()`, `waitForHydrated()`, and
  `checkNoConsoleErrors()`. Extend it for a new route.
- **Actions live on the page object** (`submitContactForm`, `setFilter`), not in specs.
- Shared chrome (nav/sidebar) is a plain component object (`NavigationComponent`), composed in.

### The SSR hydration rule (important)

The app is server-rendered, so the static DOM is interactable **before Angular hydrates**.
Anything routed through an Angular handler — a form `input`, a `<button>` `(click)` — that
fires before hydration is **silently dropped** (e.g. the contact form's first field stays
empty and `submit()` no-ops with no error). Plain `<a routerLink>` clicks are safe (they fall
back to native navigation).

Rule: a page whose actions use handlers must `await waitForHydrated()` before interacting.
`ContactPage` and `ProjectsPage` already override `waitForPageReady()` to do this.

## Writing new specs

- Use auto-retrying assertions (`expect(locator).toBeVisible()`, `.toHaveText()`,
  `.toHaveURL()`) — **never** `waitForTimeout`.
- Keep specs independent and parallel-safe (no shared state between tests).
- **Mock external network calls** — never hit live APIs. The contact form's EmailJS call is
  routed in `contact.spec.ts` (`**/api.emailjs.com/**`); follow that pattern.
- For handler-driven interactions, ensure the page object waits for hydration (see above).

## Visual regression

Baselines are chromium-only and committed under
`e2e/specs/visual.spec.ts-snapshots/`. Determinism comes from emulating
`reducedMotion: 'reduce'` (GSAP entrance animations skip entirely), disabling CSS animations,
and masking the current-year footer text.

Update baselines after an **intentional** UI change:

```bash
npx playwright test visual --project=chromium --update-snapshots
```

Review the regenerated PNGs before committing them.

> ⚠️ Baselines are OS-tagged (`-win32`) and will **not** match a Linux CI runner. Visual
> regression is intentionally excluded from CI; run it locally, or regenerate Linux baselines
> inside the official Playwright Docker image if you want it gated.

## CI

[.github/workflows/e2e.yml](.github/workflows/e2e.yml) runs on PRs and pushes to `main`.

- **`functional`** (blocking) — chromium + webkit on PRs; adds firefox + both mobile projects
  on main pushes. Excludes visual and a11y.
- **`a11y`** (advisory, non-blocking) — axe scans on chromium. Kept off the required gate while
  a known backlog (color-contrast, nested-interactive) is outstanding; make it enforcing by
  setting `continue-on-error: false` once cleared.

On failure, the `playwright-report/` HTML is uploaded as a build artifact (**Actions run →
Artifacts**), named per project.
