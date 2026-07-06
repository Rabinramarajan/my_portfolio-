import { test, expect } from '../../fixtures/test.fixtures';

/**
 * @regression — hire-me page: Calendly CTAs, FAQ accordion, contact links.
 */

test.describe('Hire-me page @regression', () => {
  test('Calendly CTAs open the scheduling page in a new tab', async ({ hireMePage, page, context }) => {
    await hireMePage.goto();

    const popupPromise = context.waitForEvent('page');
    await hireMePage.bookCallButton.click();
    const popup = await popupPromise;

    await expect
      .poll(() => popup.url(), { timeout: 10_000 })
      .toMatch(/calendly\.com/);
    await popup.close();
    await expect(page).toHaveURL(/\/hire-me$/);
  });

  test('the FAQ accordion expands and collapses with correct ARIA state', async ({ hireMePage }) => {
    await hireMePage.goto();

    const first = hireMePage.faqButton(0);
    const second = hireMePage.faqButton(1);
    await first.scrollIntoViewIfNeeded();

    await expect(first).toHaveAttribute('aria-expanded', 'false');

    await first.click();
    await expect(first).toHaveAttribute('aria-expanded', 'true');

    // Opening another entry closes the first (single-open accordion).
    await second.click();
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');

    // Clicking the open entry again collapses it.
    await second.click();
    await expect(second).toHaveAttribute('aria-expanded', 'false');
  });

  test('the email CTA is a valid mailto link', async ({ hireMePage }) => {
    await hireMePage.goto();
    await expect(hireMePage.emailButton).toHaveAttribute('href', /^mailto:.+@.+/);
  });

  test('the "#contact" CTA lands somewhere useful (suspected dead anchor)', async ({ hireMePage, page }) => {
    await hireMePage.goto();

    // href="#contact" but the contact section lives on '/', not '/hire-me'.
    await expect(hireMePage.contactAnchorButton).toHaveAttribute('href', '#contact');
    await hireMePage.contactAnchorButton.click();

    // A working CTA must reveal a #contact element; if this fails, the anchor is
    // dead and should point at '/#contact' instead.
    await expect(page.locator('#contact')).toBeInViewport();
  });
});
