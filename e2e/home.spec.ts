import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the hero positioning and both calls to action', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /let's work together/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /view selected work/i })).toBeVisible();
  });

  test('emits the SEO metadata a crawler needs', async ({ page }) => {
    await expect(page).toHaveTitle(/senior frontend angular developer/i);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{50,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https?:/);
  });

  test('publishes Person and WebSite structured data', async ({ page }) => {
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const graph = JSON.parse(raw ?? '{}')['@graph'] as { '@type': string }[];
    expect(graph.map((node) => node['@type'])).toContain('Person');
    expect(graph.map((node) => node['@type'])).toContain('WebSite');
  });

  test('exposes exactly one h1 and an ordered heading structure', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.locator('h2').count()).toBeGreaterThan(2);
  });

  test('never lets content sit invisibly behind a failed animation', async ({ page }) => {
    // Reveal animations set their "from" state only after GSAP loads; if that
    // ordering ever regresses, section copy silently disappears.
    await expect(
      page.getByRole('heading', { name: /takes the interface|hired to do/i }).first(),
    ).toBeVisible();
  });

  test('opens and closes a service row accessibly', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /angular development/i });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('filters the technology ecosystem', async ({ page }) => {
    await page.getByRole('button', { name: 'Mobile', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Mobile', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Backend', exact: true })).toHaveCount(0);
  });

  // iOS Safari does not move focus to links with Tab by default, so this
  // assertion is meaningless there — the skip link is a desktop-keyboard affordance.
  test('has a working skip link as the first tab stop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Tab does not traverse links on iOS Safari');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /skip to content/i })).toBeFocused();
  });
});
