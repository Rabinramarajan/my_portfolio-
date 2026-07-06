import { test, expect } from '../../fixtures/test.fixtures';
import { metaByName, metaByProperty, canonicalHref } from '../../utils/seo.utils';
import { SITE } from '../../data/test-data';

/**
 * @regression — blog list → detail flow + per-article dynamic SEO.
 * Titles are captured from the card and re-asserted on the detail page, so the
 * spec never hard-codes article copy.
 */

test.describe('Blog list → detail @regression', () => {
  test('the list renders cards and the first opens a matching article', async ({ blogPage, blogDetailPage, page }) => {
    await blogPage.goto();

    await expect(blogPage.featuredCard).toBeVisible();
    await expect(blogPage.gridCards).not.toHaveCount(0);

    const featuredTitle = (await blogPage.featuredTitle.textContent())?.trim() ?? '';
    expect(featuredTitle.length).toBeGreaterThan(0);

    await blogPage.featuredReadButton.click();
    await expect(page).toHaveURL(/\/blog\/[\w-]+$/);

    await expect(blogDetailPage.title).toHaveText(featuredTitle);
    await expect(blogDetailPage.article).toBeVisible();
  });

  test('article detail exposes dynamic SEO tags matching the article', async ({ blogPage, blogDetailPage, page }) => {
    await blogPage.goto();
    const featuredTitle = (await blogPage.featuredTitle.textContent())?.trim() ?? '';
    await blogPage.featuredReadButton.click();
    await expect(blogDetailPage.title).toHaveText(featuredTitle);

    const expectedTitle = `${featuredTitle} | ${SITE.titleSuffix}`;
    await expect(page).toHaveTitle(expectedTitle);
    await expect.poll(() => metaByProperty(page, 'og:title')).toBe(expectedTitle);

    const desc = await metaByName(page, 'description');
    expect(desc?.trim().length).toBeGreaterThan(0);
    await expect.poll(() => metaByProperty(page, 'og:description')).toBe(desc);

    // canonical is currently a static site-root tag from index.html — a per-route
    // canonical would be the SEO-correct upgrade.
    expect(await canonicalHref(page)).toMatch(SITE.canonicalHost);
  });

  test('the back link returns to the blog list', async ({ blogPage, blogDetailPage, page }) => {
    await blogPage.goto();
    await blogPage.featuredReadButton.click();
    await expect(blogDetailPage.title).toBeVisible();

    await blogDetailPage.backLink.click();
    await expect(page).toHaveURL(/\/blog$/);
  });
});
