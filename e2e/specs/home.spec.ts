import { test, expect } from '../fixtures';
import { HomePage } from '../pages';

test.describe('Home Page', () => {
  let home: HomePage;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.navigateTo();
  });

  test('hero renders headline, subtitle and a CTA', async () => {
    await home.expectHeroVisible();
    await expect(home.heroTitle).not.toHaveText('');
    // At least one CTA is present and actionable. Use an auto-retrying assertion:
    // the CTAs render via <app-animated-button>, which briefly re-renders during
    // hydration, so a one-shot count() can race to 0.
    await expect(home.heroCtas).not.toHaveCount(0);
  });

  test('entrance animations settle without console errors', async ({ page }) => {
    // Let GSAP-driven reveals run; auto-waiting visibility is enough — no fixed delay.
    await expect(home.heroTitle).toBeVisible();
    await expect(home.heroStats.first()).toBeVisible();
    await page.waitForLoadState('networkidle');
    await home.checkNoConsoleErrors();
  });

  test('primary CTA navigates to the projects page', async ({ page }) => {
    await home.clickCta('Explore My Work', /\/projects$/);
    await expect(page).toHaveURL(/\/projects$/);
  });
});
