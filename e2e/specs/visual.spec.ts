import { test, expect, type Page } from '@playwright/test';

/**
 * Visual regression baselines.
 *
 * Determinism strategy:
 * - `reducedMotion: 'reduce'` — the `appReveal`/`appStagger` directives bail out
 *   entirely under reduced motion (see reveal/stagger directives), so GSAP never
 *   runs and the DOM renders in its final state. No need to mask the hero.
 * - `animations: 'disabled'` — freezes any remaining CSS animations (the
 *   availability pulse dot, spinners) to their first frame.
 * - Dynamic text (the footer's current-year copyright) is masked so a year
 *   rollover can't flip every baseline.
 *
 * Baselines are chromium-only to avoid cross-engine font-rendering noise. See
 * E2E_TESTING.md for how to (re)generate them.
 */

test.use({ reducedMotion: 'reduce' });

const VIEWPORTS = [
  { label: 'desktop', width: 1280, height: 800 },
  { label: 'mobile', width: 390, height: 844 },
] as const;

const PAGES: Array<{ name: string; path: string }> = [
  { name: 'home', path: '/' },
  { name: 'projects', path: '/projects' },
  { name: 'contact', path: '/contact' },
];

/** Load the route and settle: hydrate, trigger lazy images, return to top. */
async function prepare(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  // Full-page shots need lazy (`loading="lazy"`) images realized first.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        window.scrollTo(0, document.body.scrollHeight);
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
          resolve();
        });
      }),
  );
  await page.waitForLoadState('networkidle');
}

test.describe('Visual regression', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'visual baselines are captured on chromium only',
    );
  });

  for (const { name, path } of PAGES) {
    for (const vp of VIEWPORTS) {
      test(`${name} — ${vp.label}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await prepare(page, path);

        await expect(page).toHaveScreenshot(`${name}-${vp.label}.png`, {
          fullPage: true,
          animations: 'disabled',
          // Current-year copyright text — masked so a year change doesn't flake.
          mask: [page.locator('.ft__copy')],
          maxDiffPixelRatio: 0.02,
        });
      });
    }
  }
});
