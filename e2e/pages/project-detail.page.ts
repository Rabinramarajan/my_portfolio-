import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ROUTES } from '../constants';

export class ProjectDetailPage extends BasePage {
  protected readonly path = ROUTES.home; // navigate via gotoSlug

  readonly title: Locator;
  readonly notFoundTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('h1.proj-title');
    this.notFoundTitle = page.locator('.proj-missing-title');
  }

  async gotoSlug(slug: string): Promise<void> {
    await this.page.goto(ROUTES.projectDetail(slug));
  }
}
