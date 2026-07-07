import { test, expect } from '@playwright/test';
import { scanAccessibility, scanBothThemes } from './utils/axe-scan.util';

test.describe('Accessibility - Lighthouse & Axe', () => {
  test('should have no accessibility violations on home page (dark mode)', async ({ page }) => {
    await page.goto('/');
    const result = await scanAccessibility(page, 'dark');
    expect(result.totalViolations).toBe(0);
  });

  test('should have no accessibility violations on home page (light mode)', async ({ page }) => {
    await page.goto('/');
    const result = await scanAccessibility(page, 'light');
    expect(result.totalViolations).toBe(0);
  });

  test('should have no accessibility violations on blog page (dark mode)', async ({ page }) => {
    await page.goto('/blog');
    const result = await scanAccessibility(page, 'dark');
    expect(result.totalViolations).toBe(0);
  });

  test('should have no accessibility violations on blog page (light mode)', async ({ page }) => {
    await page.goto('/blog');
    const result = await scanAccessibility(page, 'light');
    expect(result.totalViolations).toBe(0);
  });

  test('should have sufficient contrast in both themes', async ({ page }) => {
    await page.goto('/');
    const { dark, light } = await scanBothThemes(page);

    const darkContrast = dark.violations.filter(v => v.id === 'color-contrast');
    const lightContrast = light.violations.filter(v => v.id === 'color-contrast');

    expect(darkContrast.length).toBe(0);
    expect(lightContrast.length).toBe(0);
  });

  test('should have proper landmark structure', async ({ page }) => {
    await page.goto('/');
    const landmarks = await page.locator('main, [role="main"], section[aria-labelledby]').count();
    expect(landmarks).toBeGreaterThan(0);
  });

  test('should trap focus in mobile nav when open', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 812 });

    const menuButton = page.locator('[data-nav-toggle]');
    await menuButton.click();
    await page.waitForTimeout(300);

    const navLinks = page.locator('nav.nav-menu a[href]');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Tab should cycle through links
    const firstLink = navLinks.first();
    const lastLink = navLinks.last();

    await firstLink.focus();
    await page.keyboard.press('Shift+Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('href'));
    expect(focusedElement).toBe(await lastLink.getAttribute('href'));
  });

  test('should close mobile nav on Escape key', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 812 });

    const menuButton = page.locator('[data-nav-toggle]');
    const nav = page.locator('nav.nav-menu');

    await menuButton.click();
    await expect(nav).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(nav).not.toBeVisible();
  });
});
