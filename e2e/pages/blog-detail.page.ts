import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ROUTES } from '../constants';

export class BlogDetailPage extends BasePage {
  protected readonly path = ROUTES.blog; // navigate via gotoSlug

  readonly title: Locator;
  readonly article: Locator;
  readonly backLink: Locator;
  readonly notFoundTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('h1.post-title');
    this.article = page.locator('article.post');
    this.backLink = page.locator('.post-back');
    this.notFoundTitle = page.locator('.post-missing-title');
  }

  async gotoSlug(slug: string): Promise<void> {
    await this.page.goto(ROUTES.blogDetail(slug));
  }
}
