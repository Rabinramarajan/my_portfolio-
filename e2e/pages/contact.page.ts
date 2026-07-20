import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/** Contact route ('/contact') — Signal Forms + EmailJS submission. */
export class ContactPage extends BasePage {
  readonly path = '/contact';

  readonly form: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly subjectInput: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;
  /** Success banner (role="status"). */
  readonly successBanner: Locator;
  /** Error banner (role="alert"). */
  readonly errorBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.getByTestId('contact-form');
    this.nameInput = page.getByLabel('Your name');
    this.emailInput = page.getByLabel('Your email');
    this.subjectInput = page.getByLabel('Subject');
    this.messageInput = page.getByLabel('Message');
    this.submitButton = page.getByRole('button', { name: 'Send Message' });
    this.successBanner = page.getByRole('status');
    this.errorBanner = page.getByRole('alert');
  }

  /**
   * The Signal Forms `[formField]` `input` listener only exists after hydration;
   * filling a field before then drops the event and the model never updates
   * (see {@link BasePage.waitForHydrated}). Forms are the sharpest case of this.
   */
  override async waitForPageReady(): Promise<void> {
    await super.waitForPageReady();
    await this.waitForHydrated();
  }

  async fillForm(fields: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    await this.nameInput.fill(fields.name);
    await this.emailInput.fill(fields.email);
    await this.subjectInput.fill(fields.subject);
    await this.messageInput.fill(fields.message);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /** Fill and submit in one step. */
  async submitContactForm(
    name: string,
    email: string,
    subject: string,
    message: string,
  ): Promise<void> {
    await this.fillForm({ name, email, subject, message });
    await this.submit();
  }

  /** The inline validation message for a given field id (e.g. 'c-email'). */
  fieldError(fieldId: string): Locator {
    return this.page.locator(`#${fieldId}-error`);
  }

  async expectSubmitted(): Promise<void> {
    await expect(this.successBanner).toBeVisible();
  }
}
