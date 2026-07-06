import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ROUTES } from '../constants';

export class StyleguidePage extends BasePage {
  protected readonly path = ROUTES.styleguide;

  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('h1.sg-title');
  }
}
