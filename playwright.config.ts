import { defineConfig, devices } from '@playwright/test';
import { ENV } from './e2e/config/environments';

/**
 * Enterprise Playwright configuration.
 *
 * Environments: TEST_ENV=dev|qa|staging|uat|prod (see e2e/config/environments.ts).
 *   dev boots `ng serve`; all others target a deployed BASE_URL.
 * Browsers: chromium, firefox, webkit, edge (msedge channel; local/optional).
 * Tags: @smoke @regression @visual @a11y @perf — filter with `--grep`.
 * Reporters: HTML + JUnit + JSON always; Allure when ALLURE=1.
 */
export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 7_500 },

  globalSetup: './e2e/config/global-setup.ts',
  globalTeardown: './e2e/config/global-teardown.ts',

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ...(process.env.ALLURE ? [['allure-playwright', { outputFolder: 'allure-results' }] as const] : []),
    ['list'],
  ],

  use: {
    baseURL: ENV.baseURL,
    extraHTTPHeaders: ENV.extraHTTPHeaders,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'retain-on-failure' : 'off',
    testIdAttribute: 'data-testid',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // Branded Edge — requires Microsoft Edge installed (not on CI runners by
    // default). Run explicitly with: npm run e2e -- --project=edge
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
  ],

  webServer: ENV.useLocalServer
    ? {
        command: 'npm start',
        url: ENV.baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
});
