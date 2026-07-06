import type { Page } from '@playwright/test';

export const EMAILJS_API = '**/api.emailjs.com/**';

/**
 * Intercept EmailJS at the network layer so tests NEVER send real email.
 * The browser SDK resolves on a 200 "OK" text body.
 */
export function mockEmailJs(
  page: Page,
  opts: { status?: number; body?: string; delayMs?: number } = {},
) {
  return page.route(EMAILJS_API, async (route) => {
    if (opts.delayMs) await new Promise((r) => setTimeout(r, opts.delayMs));
    await route.fulfill({
      status: opts.status ?? 200,
      contentType: 'text/plain',
      body: opts.body ?? 'OK',
    });
  });
}

/** Block third-party analytics so runs are deterministic and leave no trace. */
export function blockAnalytics(page: Page) {
  return page.route(/vercel-insights|vercel-analytics|va\.vercel/, (route) => route.abort());
}
