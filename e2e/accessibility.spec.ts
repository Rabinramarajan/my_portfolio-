import { expect, test } from '@playwright/test';

const PAGES = ['/', '/work', '/resume', '/contact'];

test.describe('accessibility and resilience', () => {
  for (const path of PAGES) {
    test(`${path} has landmarks, a title and no unlabelled images`, async ({ page }) => {
      await page.goto(path);

      // Landmark *roles*, not tag counts — <header>/<footer> nested in articles
      // are ordinary sectioning content and must not be mistaken for landmarks.
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.getByRole('banner')).toHaveCount(1);
      await expect(page.getByRole('contentinfo')).toHaveCount(1);
      expect(await page.title()).not.toBe('');

      const unlabelled = await page.locator('img:not([alt])').count();
      expect(unlabelled).toBe(0);
    });
  }

  test('every image reserves its space to avoid layout shift', async ({ page }) => {
    await page.goto('/work');
    const images = page.locator('img');
    for (let i = 0; i < (await images.count()); i++) {
      const image = images.nth(i);
      expect(await image.getAttribute('width')).toBeTruthy();
      expect(await image.getAttribute('height')).toBeTruthy();
    }
  });

  test('is fully keyboard navigable from the header into the page', async ({ page }) => {
    await page.goto('/');
    for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName ?? '');
    expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focused);
  });

  test('drops the custom cursor on touch devices', async ({ page, isMobile }) => {
    await page.goto('/');
    if (isMobile) {
      await expect(page.locator('.cursor')).toHaveCount(0);
    } else {
      await expect(page.locator('app-cursor')).toHaveCount(1);
    }
  });

  test('renders a static fallback instead of WebGL under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('.wf__fallback')).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(0);
    // The content must still be readable — the fallback is a look, not a downgrade.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
