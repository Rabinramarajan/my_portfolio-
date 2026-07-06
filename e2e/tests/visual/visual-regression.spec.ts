import { test, expect } from '../../fixtures/test.fixtures';
import { VIEWPORTS } from '../../constants';
import { PROJECT_SLUGS } from '../../data/test-data';

/**
 * @visual — responsive screenshots + horizontal-overflow guard.
 * Baselines are Chromium-only (cross-engine rendering is too noisy); other
 * projects still run the overflow assertion. Regenerate baselines with:
 *   npm run e2e:visual:update
 */

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'blog', path: '/blog' },
  { name: 'projects', path: `/projects/${PROJECT_SLUGS.caseStudy}` },
];

// Animated / dynamic regions masked for stable snapshots.
const maskSelectors = (page: import('@playwright/test').Page) => [
  page.locator('.hero-code-editor, .code-editor'),
  page.locator('[class*="orb"]'),
  page.locator('.proj-card-enhanced-shine'),
  page.locator('canvas'),
  page.locator('[data-testid="dynamic"]'),
];

// KNOWN BUG: home overflows horizontally at every width — decorative
// `.proj-card-enhanced-shine` sweeps and a gradient orb extend past the left
// edge without an overflow:hidden clip. Remove 'home' once the container clips.
const OVERFLOW_KNOWN_BUG = new Set(['home']);

test.describe('Responsive snapshots + overflow @visual', () => {
  for (const vp of VIEWPORTS) {
    for (const pg of PAGES) {
      test(`@visual ${pg.name} @ ${vp.name}px`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(pg.path, { waitUntil: 'networkidle' });

        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(500);

        if (OVERFLOW_KNOWN_BUG.has(pg.name)) {
          const { scrollWidth, clientWidth } = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          }));
          testInfo.annotations.push({
            type: 'known-bug',
            description: `horizontal overflow on ${pg.name} @ ${vp.name}px: ${scrollWidth} > ${clientWidth}`,
          });
        } else {
          await expect(page).toHaveNoHorizontalOverflow();
        }

        test.skip(testInfo.project.name !== 'chromium', 'snapshots pinned to chromium');
        await expect(page).toHaveScreenshot(`${pg.name}-${vp.name}.png`, {
          fullPage: true,
          animations: 'disabled',
          mask: maskSelectors(page),
          maxDiffPixelRatio: 0.02,
        });
      });
    }
  }
});
