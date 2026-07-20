import { defineConfig, devices } from '@playwright/test';

const isCI = !!(globalThis as any).process?.env?.CI;

/**
 * Playwright configuration for the Angular 22 (zoneless) portfolio.
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  // Run specs within a file in parallel. Keeps the suite fast and forces
  // each spec to be independent (no shared state) — required for zoneless safety.
  fullyParallel: true,

  // Fail the CI build if a `test.only` was accidentally committed.
  forbidOnly: isCI,

  // Retry only on CI; locally a failure should surface immediately.
  retries: isCI ? 2 : 0,

  // Single worker on CI for deterministic ordering/resources. Locally, cap at 2:
  // the app is served by a single Angular *dev* server, and letting Playwright's
  // default (50% of cores) spin up many parallel browsers starves the slower
  // desktop-WebKit engine's hydration, timing out navigation/interaction specs.
  workers: isCI ? 1 : 2,

  // WebKit is markedly slower under local parallel execution, so a route
  // transition can outrun the 30s default. Give every test generous headroom.
  timeout: 90 * 1000,
  expect: { timeout: 10 * 1000 },

  reporter: isCI ? [['html'], ['github']] : 'html',

  use: {
    baseURL: 'http://localhost:4200',

    // Capture debugging artifacts only when something goes wrong.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },

    // Dedicated mobile viewport project for responsive checks.
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    // Reuse a dev server already running locally; always start fresh on CI.
    reuseExistingServer: !isCI,
    // Angular 22 cold builds can be slow — prior runs hit the default 60s ceiling.
    timeout: 180 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
