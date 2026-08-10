import { defineConfig, devices } from '@playwright/test';

const PORT = 4300;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  // Headless Firefox on some hosts drops its compositor mid-run; one retry
  // keeps browser-level flake from masking real failures.
  retries: process.env['CI'] ? 2 : 1,
  // Four browser projects against one server; unbounded workers starve the
  // machine and produce timeouts that say nothing about the application.
  workers: process.env['CI'] ? 1 : 2,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'desktop-firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
    // A dedicated project pinning the reduced-motion path, which is a real
    // rendering mode for this site rather than a cosmetic preference.
    {
      name: 'reduced-motion',
      use: { ...devices['Desktop Chrome'], reducedMotion: 'reduce' },
    },
  ],
  // Tests run against the production SSR build, not `ng serve`. The dev server
  // compiles lazily and hydrates slowly enough under parallel load to produce
  // failures that say nothing about the application; this also means the suite
  // exercises the real SSR output, hydration and prerendered routes.
  webServer: {
    command: 'npm run build && node dist/web/server/server.mjs',
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env['CI'],
    timeout: 300_000,
  },
});
