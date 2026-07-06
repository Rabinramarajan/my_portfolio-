import { test, expect } from '../../fixtures/test.fixtures';
import { ROUTES } from '../../constants';

/**
 * @perf — lightweight performance guards. These are smoke-level budgets, not a
 * Lighthouse replacement: they catch regressions (payload bloat, eager images,
 * slow first render) without flaky lab metrics. Budgets are dev-server
 * friendly; tighten them for TEST_ENV=prod runs.
 */

test.describe('Performance guards @perf', () => {
  test('home reaches DOMContentLoaded within budget', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'perf timings pinned to chromium');

    await page.goto(ROUTES.home, { waitUntil: 'load' });
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });

    expect(timing.domContentLoaded, 'DOMContentLoaded (ms)').toBeLessThan(10_000);
  });

  test('below-the-fold images are lazy-loaded', async ({ homePage, page }) => {
    await homePage.goto();

    // Project/case-study imagery is below the fold and must not be eager.
    const eagerBelowFold = await page.evaluate(() => {
      const viewportBottom = window.innerHeight;
      return Array.from(document.querySelectorAll('img'))
        .filter((img) => img.getBoundingClientRect().top > viewportBottom * 2)
        .filter((img) => img.loading !== 'lazy')
        .map((img) => img.src.split('/').pop());
    });

    expect(eagerBelowFold, `below-the-fold images missing loading="lazy"`).toEqual([]);
  });

  test('no failed (4xx/5xx) requests while loading each route', async ({ page }) => {
    const failed: string[] = [];
    page.on('response', (res) => {
      if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`);
    });

    for (const route of [ROUTES.home, ROUTES.blog, ROUTES.hireMe]) {
      await page.goto(route, { waitUntil: 'networkidle' });
    }

    expect(failed, `failed requests:\n${failed.join('\n')}`).toEqual([]);
  });
});
