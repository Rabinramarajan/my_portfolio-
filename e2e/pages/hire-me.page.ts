import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ROUTES } from '../constants';

export class HireMePage extends BasePage {
  protected readonly path = ROUTES.hireMe;

  readonly bookCallButton: Locator;
  readonly timelineBookButton: Locator;
  readonly finalCtaButton: Locator;
  readonly contactAnchorButton: Locator;
  readonly emailButton: Locator;
  readonly faqButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.bookCallButton = page.locator('#hm-book-call-btn');
    this.timelineBookButton = page.locator('#hm-timeline-book-btn');
    this.finalCtaButton = page.locator('#hm-final-cta-btn');
    this.contactAnchorButton = page.locator('#hm-contact-btn');
    this.emailButton = page.locator('#hm-email-btn');
    this.faqButtons = page.locator('.hm-faq-question');
  }

  faqButton(index: number): Locator {
    return this.page.locator(`#faq-btn-${index}`);
  }
}
