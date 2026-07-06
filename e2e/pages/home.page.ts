import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ContactFormComponent } from '../components/contact-form.component';
import { ROUTES } from '../constants';

export class HomePage extends BasePage {
  protected readonly path = ROUTES.home;

  readonly contactForm: ContactFormComponent;
  readonly heroTitle: Locator;
  readonly projectCards: Locator;
  readonly firstProjectTitle: Locator;
  readonly firstProjectLink: Locator;

  constructor(page: Page) {
    super(page);
    this.contactForm = new ContactFormComponent(page);
    this.heroTitle = page.locator('h1.hero-title');
    this.projectCards = page.locator('.proj-card-enhanced');
    this.firstProjectTitle = page.locator('.proj-card-enhanced-title').first();
    this.firstProjectLink = page.locator('.proj-card-enhanced-link').first();
  }

  async gotoContactSection(): Promise<void> {
    await this.goto();
    await this.page.locator('#contact').scrollIntoViewIfNeeded();
  }

  async gotoProjectsSection(): Promise<void> {
    await this.goto();
    await this.page.locator('#projects').scrollIntoViewIfNeeded();
  }
}
