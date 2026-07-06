import { test, expect } from '../../fixtures/test.fixtures';
import { metaByName, metaByProperty, canonicalHref } from '../../utils/seo.utils';
import { SITE } from '../../data/test-data';

/**
 * @regression — projects grid (home #projects; there is no /projects list
 * route) → case-study detail + dynamic SEO.
 */

test.describe('Projects grid → detail @regression', () => {
  test('the grid renders and the first card opens a matching case study', async ({ homePage, projectDetailPage, page }) => {
    await homePage.gotoProjectsSection();

    await expect(homePage.projectCards.first()).toBeVisible();
    await expect(homePage.projectCards).not.toHaveCount(0);

    const firstName = (await homePage.firstProjectTitle.textContent())?.trim() ?? '';
    expect(firstName.length).toBeGreaterThan(0);

    await homePage.firstProjectLink.click();
    await expect(page).toHaveURL(/\/projects\/[\w-]+$/);

    await expect(projectDetailPage.title).toHaveText(firstName);
  });

  test('project detail exposes dynamic SEO tags matching the case study', async ({ homePage, projectDetailPage, page }) => {
    await homePage.gotoProjectsSection();
    const firstName = (await homePage.firstProjectTitle.textContent())?.trim() ?? '';
    await homePage.firstProjectLink.click();
    await expect(projectDetailPage.title).toHaveText(firstName);

    const expectedTitle = `${firstName} — Case Study | ${SITE.titleSuffix}`;
    await expect(page).toHaveTitle(expectedTitle);
    await expect.poll(() => metaByProperty(page, 'og:title')).toBe(expectedTitle);

    const desc = await metaByName(page, 'description');
    expect(desc?.trim().length).toBeGreaterThan(0);
    await expect.poll(() => metaByProperty(page, 'og:description')).toBe(desc);

    expect(await canonicalHref(page)).toMatch(SITE.canonicalHost);
  });
});
