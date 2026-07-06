# Playwright E2E Framework

Enterprise-grade, reusable Playwright framework for Angular applications. This
repo is the reference implementation; the `e2e/` folder (plus
`playwright.config.ts`, `eslint.config.mjs`, `.env.example`, and
`.github/workflows/e2e.yml`) can be copied into any Angular project and adapted
by rewriting `pages/`, `components/`, `data/`, and `constants/`.

## Folder structure

```
e2e/
├── assertions/          Custom expect matchers (toHaveNoHorizontalOverflow, …)
├── components/          Component objects (header, footer, toast, contact form)
├── config/              environments.ts (.env layering), global setup/teardown
├── constants/           Routes, viewports, breakpoints, timeouts
├── data/                Test data (slugs, form payloads, site constants)
├── fixtures/            test.fixtures.ts — THE import point for every spec
├── pages/               Page objects (one per routed page, extend BasePage)
├── tests/
│   ├── smoke/           @smoke  — app-launch sweep
│   ├── navigation/      @regression — header, mobile menu, deep links
│   ├── content/         @regression — blog/projects flows + SEO
│   ├── forms/           @regression — contact form (EmailJS mocked)
│   ├── functional/      @regression — hire-me, widgets, footer, resume
│   ├── a11y/            @a11y   — axe WCAG 2.1 A/AA + keyboard
│   ├── perf/            @perf   — load budget, lazy images, failed requests
│   └── visual/          @visual — screenshots + overflow guard
├── utils/               seo / network mocks / console collector / axe
└── tsconfig.json
```

## Architecture rules

1. **Specs import from `fixtures/test.fixtures.ts`** — never from
   `@playwright/test` directly. That wires page objects, custom matchers, and
   the console-error collector.
2. **Page objects own locators; specs own assertions.** No `page.locator(...)`
   in specs unless it's a one-off; promote anything reused into a POM.
3. **Component objects** model shell UI shared across pages (header, toast…);
   `BasePage` composes them so every POM gets `page.header`, `page.toast`, etc.
4. **Network is mocked, never real** for third parties (`utils/network.utils.ts`
   mocks EmailJS; tests must never send real email or hit real analytics).
5. **Known product bugs stay visible**: use `test.fixme` or a documented skip
   with a `KNOWN BUG:` comment naming the source file. Never silently loosen an
   assertion to make a suite green.

## Environments

`TEST_ENV=dev|qa|staging|uat|prod` (default `dev`).

- `dev` boots `ng serve` automatically via Playwright's `webServer`.
- Every other env targets a deployed `BASE_URL` from `.env.<env>` (see
  `.env.example`). Example: `TEST_ENV=prod npm run e2e:smoke` runs the smoke
  pack against https://rabinr.in.

## Running

| Command | What it runs |
|---|---|
| `npm run e2e` | Everything, all browsers |
| `npm run e2e:smoke` | `@smoke` launch sweep |
| `npm run e2e:regression` | `@regression` functional pack |
| `npm run e2e:visual` / `:update` | Visual baselines (Chromium) |
| `npm run e2e:a11y` | axe + keyboard tests |
| `npm run e2e:perf` | Performance guards |
| `npm run e2e:headed` / `:debug` / `:ui` | Local development modes |
| `npm run e2e:report` | Open the last HTML report |
| `npm run e2e:trace <trace.zip>` | Open a trace |
| `npm run e2e:allure` | Run with Allure results (needs `allure` CLI to render) |
| `npm run e2e:lint` | ESLint over the framework |
| `npx playwright test --project=edge` | Branded Edge (requires local Edge) |

Reporters always emit: HTML (`playwright-report/`), JUnit
(`test-results/junit.xml`), JSON (`test-results/results.json`). Screenshots on
failure; video + trace retained on CI failures.

## Writing a new test

1. Add/extend a page object in `pages/` (locators + intent-level methods only).
2. Register it in `fixtures/test.fixtures.ts` if it's new.
3. Create `tests/<area>/<feature>.spec.ts`:

```ts
import { test, expect } from '../../fixtures/test.fixtures';

test.describe('Feature @regression', () => {
  test('does the thing', async ({ homePage, page }) => {
    await homePage.goto();
    await expect(homePage.heroTitle).toBeVisible();
  });
});
```

4. Tag every describe/test title: `@smoke` (fast, critical-path, must be green
   before merge), `@regression` (functional depth), `@visual`, `@a11y`, `@perf`.

## Naming conventions

- Files: `kebab-case.spec.ts`, `kebab-case.page.ts`, `kebab-case.component.ts`.
- POM classes: `HomePage`, `HeaderComponent`.
- Test titles: behaviour statements ("the hamburger opens the dropdown"), not
  implementation notes.
- Prefer `data-testid` for new markup (`testIdAttribute` is configured); the
  current specs use the app's stable CSS classes because the markup predates
  the framework.

## CI (GitHub Actions)

`.github/workflows/e2e.yml`:
- PRs/pushes to `main`: smoke + regression on chromium/firefox/webkit (matrix).
- Nightly (01:30 UTC): the full suite including visual/a11y/perf.
- `workflow_dispatch` with a custom `grep` filter.
- HTML reports uploaded per browser; traces/screenshots on failure.

## Troubleshooting

- **`ng serve` port in use**: dev reuses an existing server locally
  (`reuseExistingServer`) — just leave your server running.
- **Visual diffs after intentional UI change**: `npm run e2e:visual:update`,
  review the new PNGs in the diff, commit them.
- **A test passes locally, fails on CI**: retries are CI-only (2); open the
  uploaded trace artifact with `npm run e2e:trace`.
- **Edge project fails**: Edge must be installed locally; it is not part of the
  CI matrix by design.
- **Windows env vars in scripts**: use the provided npm scripts (`cross-env`)
  rather than `VAR=x` inline.

## Known product bugs tracked by this suite

| Bug | Where documented |
|---|---|
| Contact form cannot send in ANY build (placeholder EmailJS creds in both environment files) | `tests/forms/contact-form.spec.ts` |
| Home hero `<h1>` rendered blank (FloatingTextDirective async race) | `tests/smoke/app-launch.spec.ts` |
| Scroll-spy never activates (Header observer races routed content) | `tests/navigation/navigation.spec.ts` (`test.fixme`) |
| Home horizontal overflow at all widths (`.proj-card-enhanced-shine`, orb) | `tests/visual/visual-regression.spec.ts` |
| Footer external links missing `rel="noopener"` | `tests/functional/widgets.spec.ts` |
| `/hire-me` `#contact` anchor suspected dead | `tests/functional/hire-me.spec.ts` |

## Scaling & maintenance recommendations

- Keep `data/test-data.ts` in sync with `public/portfolio-data.json`, or load
  the JSON directly for fully data-driven assertions.
- Gate merges on the smoke pack; run regression nightly and before releases.
- Review visual baselines like code — a baseline update is a UI change.
- When reusing in an app with auth: add a `storageState` step in
  `config/global-setup.ts` and an `auth.fixtures.ts` exposing logged-in pages;
  guard/role tests then live in `tests/navigation/`.
- Grow one POM per new routed page; never let specs accumulate raw selectors.
- Re-run `npm run e2e:lint` in CI once the repo adopts ESLint app-wide.
