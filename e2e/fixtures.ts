import { test as base, expect } from '@playwright/test';

/**
 * Shared test fixtures.
 *
 * WebKit workaround: the app enables Angular Router `withViewTransitions()`, so
 * every client-side navigation calls `document.startViewTransition()`. Playwright's
 * bundled WebKit crashes the page on that call (real Safari 18+ handles it fine),
 * which fails any spec that navigates within the SPA. We neutralize the View
 * Transitions API on WebKit only, so navigation is exercised without the crash
 * while Chromium/Firefox still run the real transition path.
 */
export const test = base.extend({
  page: async ({ page, browserName }, use) => {
    if (browserName === 'webkit') {
      await page.addInitScript(() => {
        // Opt out of View Transitions; the router falls back to an instant swap.
        (document as unknown as { startViewTransition?: unknown }).startViewTransition = undefined;
      });
    }
    await use(page);
  },
});

export { expect };
