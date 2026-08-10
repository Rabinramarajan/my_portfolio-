import { expect, test } from '@playwright/test';

test.describe('navigation', () => {
  test('moves from home to a case study and back', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /view selected work/i }).click();
    await expect(page).toHaveURL(/\/work$/);

    await page.locator('app-project-card a').first().click();
    await expect(page).toHaveURL(/\/work\/[a-z0-9-]+$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.getByRole('link', { name: 'Work', exact: true }).first().click();
    await expect(page).toHaveURL(/\/work$/);
  });

  test('gives every project page its own title and canonical url', async ({ page }) => {
    await page.goto('/work');
    const first = page.locator('app-project-card a').first();
    const href = await first.getAttribute('href');
    await first.click();

    await expect(page).toHaveTitle(/case study/i);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain(href ?? '');
  });

  test('filters the work index by category', async ({ page }) => {
    await page.goto('/work');
    const cards = page.locator('app-project-card');
    const total = await cards.count();
    await page.getByRole('button', { name: 'Mobile Application', exact: true }).click();
    await expect(cards).not.toHaveCount(total);
  });

  test('shows a helpful 404 for an unknown route', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/doesn't exist/i);
    await page.getByRole('link', { name: /back to home/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('redirects /projects to /work', async ({ page }) => {
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/work$/);
  });
});

test.describe('mobile navigation', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens the fullscreen menu and navigates from it', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /open menu/i });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(page.getByRole('button', { name: /close menu/i })).toBeVisible();

    await page
      .locator('#mobile-menu')
      .getByRole('link', { name: /contact/i })
      .click();
    await expect(page).toHaveURL(/\/contact$/);
    // Navigation must close the menu, or the next page is unreachable.
    await expect(page.getByRole('button', { name: /open menu/i })).toBeVisible();
  });
});
