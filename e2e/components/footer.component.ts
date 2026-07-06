import type { Locator, Page } from '@playwright/test';

export class FooterComponent {
  readonly root: Locator;
  readonly socialLinks: Locator;
  readonly quickLinks: Locator;
  readonly mailtoLink: Locator;

  constructor(page: Page) {
    this.root = page.locator('app-footer');
    this.socialLinks = page.locator('.footer-social');
    this.quickLinks = page.locator('.footer-link');
    this.mailtoLink = page.locator('.footer-contact-link');
  }
}
