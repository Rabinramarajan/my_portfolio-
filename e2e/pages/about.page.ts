import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { NavigationComponent } from './navigation.component';

/** About route ('/about'). */
export class AboutPage extends BasePage {
  readonly path = '/about';

  readonly nav: NavigationComponent;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationComponent(page);
    this.title = page.getByRole('heading', { level: 1 });
  }
}
