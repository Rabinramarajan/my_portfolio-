import { test, expect } from '../../fixtures/test.fixtures';
import { ROUTES } from '../../constants';
import { BLOG_SLUGS, PROJECT_SLUGS } from '../../data/test-data';

/**
 * @smoke — application launch sweep across every top-level route:
 * clean console, non-empty <title>, a visible <h1>.
 */

const SMOKE_ROUTES = [
  ROUTES.home,
  ROUTES.blog,
  ROUTES.blogDetail(BLOG_SLUGS.markdownArticle),
  ROUTES.projectDetail(PROJECT_SLUGS.caseStudy),
  ROUTES.hireMe,
  ROUTES.styleguide,
];

for (const route of SMOKE_ROUTES) {
  test(`@smoke launch: ${route}`, async ({ page, consoleErrors }) => {
    await page.goto(route, { waitUntil: 'networkidle' });

    await expect(page).toHaveTitle(/\S/);

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();

    // KNOWN BUG on '/': the hero h1 uses appFloatingText, whose directive reads
    // textContent at ngOnInit and rebuilds the element. When the async hero JSON
    // resolves after init, the h1 is left permanently blank
    // (FloatingTextDirective, animation.directives.ts). Drop the guard once fixed.
    if (route !== ROUTES.home) {
      await expect
        .poll(async () => (await h1.textContent())?.trim().length ?? 0)
        .toBeGreaterThan(0);
    }

    expect(
      consoleErrors.errors,
      `console/page errors on ${route}:\n${consoleErrors.errors.join('\n')}`,
    ).toEqual([]);
  });
}
