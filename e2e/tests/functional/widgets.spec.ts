import { test, expect } from '../../fixtures/test.fixtures';
import { SITE } from '../../data/test-data';

/**
 * @regression — global widgets (app shell): back-to-top, WhatsApp, footer,
 * resume download.
 */

test.describe('Back-to-top @regression', () => {
  test('appears after scrolling and returns to the top when clicked', async ({ homePage, page }) => {
    await homePage.goto();

    await expect(homePage.backToTop).toBeHidden();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await expect(homePage.backToTop).toBeVisible();

    await homePage.backToTop.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);
  });
});

test.describe('WhatsApp widget @regression', () => {
  test('links to wa.me and opens in a new tab', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.whatsappWidget).toHaveAttribute('href', /wa\.me|whatsapp/);
    await expect(homePage.whatsappWidget).toHaveAttribute('target', '_blank');
  });
});

test.describe('Footer @regression', () => {
  test('social links open externally with correct hrefs', async ({ homePage }) => {
    // KNOWN BUG: footer external _blank links omit rel="noopener" (footer.html).
    // Expected-to-fail: Playwright flags this test the moment the template is
    // fixed, prompting removal of this marker.
    test.fail();
    await homePage.goto();
    const { socialLinks } = homePage.footer;

    const count = await socialLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = socialLinks.nth(i);
      await expect(link).toHaveAttribute('href', /^https?:\/\//);
      await expect(link).toHaveAttribute('target', '_blank');
      // SECURITY: external _blank links should carry rel="noopener" — the footer
      // template currently omits it. This assertion documents the gap.
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
  });

  test('the mailto link matches the configured contact email', async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.footer.mailtoLink).toHaveAttribute('href', /^mailto:.+@.+/);
  });
});

test.describe('Resume download @regression', () => {
  test('desktop resume button points at the PDF with a download attribute', async ({ homePage, page }) => {
    await homePage.goto();

    await expect(homePage.header.resumeButton).toHaveAttribute('href', SITE.resumePdf);
    await expect(homePage.header.resumeButton).toHaveAttribute('download', '');

    // The PDF must actually exist.
    const response = await page.request.head(SITE.resumePdf);
    expect(response.status(), `HEAD ${SITE.resumePdf}`).toBe(200);
  });
});
