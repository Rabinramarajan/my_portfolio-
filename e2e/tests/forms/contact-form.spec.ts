import type { Page } from '@playwright/test';
import { test, expect } from '../../fixtures/test.fixtures';
import { mockEmailJs } from '../../utils/network.utils';
import { CONTACT_FORM } from '../../data/test-data';
import type { HomePage } from '../../pages/home.page';

/**
 * @regression — contact form: validation, submission, toasts, rate limit.
 * EmailJS is mocked at the network layer (api.emailjs.com) — tests never send
 * real email.
 *
 * KNOWN BUG: environment.ts AND environment.prod.ts both ship placeholder
 * EmailJS credentials ('your_public_key' …) and angular.json has no
 * fileReplacements, so the form cannot send in ANY build. The mocked-submission
 * suite detects this via the ContactService console warning and auto-skips; it
 * un-skips itself the moment real credentials land.
 */

async function gotoContact(page: Page, homePage: HomePage): Promise<{ configured: boolean }> {
  let configured = true;
  page.on('console', (msg) => {
    if (msg.type() === 'warning' && msg.text().includes('EmailJS not configured')) {
      configured = false;
    }
  });
  await homePage.gotoContactSection();
  return { configured };
}

test.describe('Contact form validation @regression', () => {
  test('required errors appear per field after touch, and clear when fixed', async ({ homePage, page }) => {
    await gotoContact(page, homePage);
    const form = homePage.contactForm;

    await form.touchAllFields();

    await expect(form.fieldError('Name is required')).toBeVisible();
    await expect(form.fieldError('Email is required')).toBeVisible();
    await expect(form.fieldError('Subject is required')).toBeVisible();
    await expect(form.fieldError('Message is required')).toBeVisible();

    await form.name.fill(CONTACT_FORM.valid.name);
    await expect(form.fieldError('Name is required')).toBeHidden();
  });

  test('rejects bad email format and too-short values', async ({ homePage, page }) => {
    await gotoContact(page, homePage);
    const form = homePage.contactForm;

    await form.email.fill(CONTACT_FORM.invalid.badEmail);
    await form.subject.fill(CONTACT_FORM.invalid.shortSubject);
    await form.message.fill(CONTACT_FORM.invalid.shortMessage);
    await page.locator('body').click(); // blur

    await expect(form.fieldError('Invalid email format')).toBeVisible();
    await expect(form.fieldError('Subject must be at least 5 characters')).toBeVisible();
    await expect(form.fieldError('Message must be at least 10 characters')).toBeVisible();
  });

  test('submit button is disabled until the form is valid', async ({ homePage, page }) => {
    await gotoContact(page, homePage);
    const form = homePage.contactForm;

    await expect(form.submit).toBeDisabled();
    await form.fill();
    await expect(form.submit).toBeEnabled();
  });
});

test.describe('Contact form — current unconfigured behaviour @regression', () => {
  // Documents today's reality; retire once real EmailJS credentials are wired up
  // (the mocked suite below un-skips automatically at that point).
  test('submit surfaces the "not configured" error toast', async ({ homePage, page }) => {
    const { configured } = await gotoContact(page, homePage);
    test.skip(configured, 'EmailJS is now configured — retire this test');

    await homePage.contactForm.fill();
    await homePage.contactForm.submit.click();

    await expect(homePage.toast.errorMessage).toHaveText(/Email service is not configured/);
  });
});

test.describe('Contact form submission (EmailJS mocked) @regression', () => {
  test('successful submit shows a success toast and resets the form', async ({ homePage, page }) => {
    await mockEmailJs(page);
    const { configured } = await gotoContact(page, homePage);
    test.skip(!configured, 'EmailJS credentials are placeholders — form cannot send');

    await homePage.contactForm.fill();
    await homePage.contactForm.submit.click();

    await expect(homePage.toast.successMessage).toHaveText(/Message sent successfully/);
    await expect(homePage.contactForm.name).toHaveValue('');
    await expect(homePage.contactForm.message).toHaveValue('');
  });

  test('EmailJS failure shows an error toast and keeps the form values', async ({ homePage, page }) => {
    await mockEmailJs(page, { status: 400, body: 'Bad Request' });
    const { configured } = await gotoContact(page, homePage);
    test.skip(!configured, 'EmailJS credentials are placeholders — form cannot send');

    await homePage.contactForm.fill();
    await homePage.contactForm.submit.click();

    await expect(homePage.toast.errorMessage).toHaveText(/Unable to send message/);
    await expect(homePage.contactForm.name).toHaveValue(CONTACT_FORM.valid.name);
  });

  test('second submit within 30s is rate-limited with an error toast', async ({ homePage, page }) => {
    await mockEmailJs(page);
    const { configured } = await gotoContact(page, homePage);
    test.skip(!configured, 'EmailJS credentials are placeholders — form cannot send');

    await homePage.contactForm.fill();
    await homePage.contactForm.submit.click();
    await expect(homePage.toast.success).toBeVisible();

    await homePage.contactForm.fill();
    await homePage.contactForm.submit.click();
    await expect(homePage.toast.errorMessage).toHaveText(/wait 30 seconds/);
  });

  test('shows a sending state while the request is in flight', async ({ homePage, page }) => {
    await mockEmailJs(page, { delayMs: 1500 });
    const { configured } = await gotoContact(page, homePage);
    test.skip(!configured, 'EmailJS credentials are placeholders — form cannot send');

    await homePage.contactForm.fill();
    await homePage.contactForm.submit.click();

    await expect(homePage.contactForm.submit).toHaveText(/Sending/);
    await expect(homePage.contactForm.submit).toBeDisabled();
    await expect(homePage.toast.success).toBeVisible();
  });
});
