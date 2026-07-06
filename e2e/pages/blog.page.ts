import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ROUTES } from '../constants';

export class BlogPage extends BasePage {
  protected readonly path = ROUTES.blog;

  readonly featuredCard: Locator;
  readonly featuredTitle: Locator;
  readonly featuredReadButton: Locator;
  readonly gridCards: Locator;

  constructor(page: Page) {
    super(page);
    this.featuredCard = page.locator('.blog-featured-card');
    this.featuredTitle = page.locator('.blog-featured-title');
    this.featuredReadButton = page.locator('.blog-read-btn').first();
    this.gridCards = page.locator('.blog-card');
  }
}
