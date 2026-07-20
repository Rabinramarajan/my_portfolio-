import { test, expect } from '@playwright/test';
import { ContactPage } from '../pages';

const EMAILJS = '**/api.emailjs.com/**';

const VALID = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  subject: 'Project inquiry',
  message: 'I would like to discuss a new Angular project with you.',
};

test.describe('Contact Form', () => {
  let contact: ContactPage;

  test.beforeEach(async ({ page }) => {
    contact = new ContactPage(page);
    // Never hit the live EmailJS API — default every run to a success response;
    // individual tests override this route as needed.
    await page.route(EMAILJS, (route) =>
      route.fulfill({ status: 200, contentType: 'text/plain', body: 'OK' }),
    );
    await contact.navigateTo();
  });

  test('valid submission shows the success state', async () => {
    await contact.submitContactForm(VALID.name, VALID.email, VALID.subject, VALID.message);
    await expect(contact.successBanner).toBeVisible();
    await expect(contact.successBanner).toContainText(/sent/i);
  });

  test('empty submission surfaces required-field validation', async () => {
    await contact.submit();
    await expect(contact.successBanner).toHaveCount(0);
    await expect(contact.fieldError('c-name')).toBeVisible();
    await expect(contact.fieldError('c-email')).toBeVisible();
    await expect(contact.fieldError('c-message')).toBeVisible();
  });

  test('invalid email format is rejected client-side', async () => {
    await contact.fillForm({ ...VALID, email: 'not-an-email' });
    await contact.submit();
    await expect(contact.fieldError('c-email')).toBeVisible();
    await expect(contact.fieldError('c-email')).toContainText(/valid email/i);
    await expect(contact.successBanner).toHaveCount(0);
  });

  test('network failure shows a graceful error state', async ({ page }) => {
    await page.route(EMAILJS, (route) => route.abort('failed'));
    await contact.submitContactForm(VALID.name, VALID.email, VALID.subject, VALID.message);
    await expect(contact.errorBanner).toBeVisible();
    await expect(contact.successBanner).toHaveCount(0);
  });
});
