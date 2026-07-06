import type { Locator, Page } from '@playwright/test';
import { CONTACT_FORM } from '../data/test-data';

/**
 * Contact form (home #contact section). Reactive form: name min 2, email
 * format, subject min 5, message min 10 — all required. Submit is [disabled]
 * while invalid, so validation errors surface via blur (touched), not click.
 */
export class ContactFormComponent {
  readonly name: Locator;
  readonly email: Locator;
  readonly subject: Locator;
  readonly message: Locator;
  readonly submit: Locator;

  constructor(private readonly page: Page) {
    this.name = page.locator('#contact-name');
    this.email = page.locator('#contact-email');
    this.subject = page.locator('#contact-subject');
    this.message = page.locator('#contact-message');
    this.submit = page.locator('.contact-send-btn');
  }

  fieldError(text: string | RegExp): Locator {
    return this.page.locator('.form-error', { hasText: text });
  }

  async fill(data: typeof CONTACT_FORM.valid = CONTACT_FORM.valid): Promise<void> {
    await this.name.fill(data.name);
    await this.email.fill(data.email);
    await this.subject.fill(data.subject);
    await this.message.fill(data.message);
  }

  /** Focus + blur every field so `touched` validation errors render. */
  async touchAllFields(): Promise<void> {
    for (const field of [this.name, this.email, this.subject, this.message]) {
      await field.click();
      await this.page.locator('body').click();
    }
  }
}
