import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { NavigationComponent } from './navigation.component';

/** Home / landing route ('/'). */
export class HomePage extends BasePage {
  readonly path = '/';

  readonly nav: NavigationComponent;
  readonly hero: Locator;
  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly heroCtas: Locator;
  readonly heroStats: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationComponent(page);
    this.hero = page.getByTestId('hero');
    this.heroTitle = this.hero.getByRole('heading', { level: 1 });
    this.heroSubtitle = page.getByTestId('hero-subtitle');
    // CTAs render as links (routerLink/href) or buttons via <app-animated-button>.
    this.heroCtas = this.hero.locator('.hero__ctas a, .hero__ctas button');
    this.heroStats = this.hero.locator('.hero__stat');
  }

  /** A hero CTA by its visible label. */
  cta(label: string): Locator {
    return this.hero
      .getByRole('link', { name: label })
      .or(this.hero.getByRole('button', { name: label }));
  }

  /**
   * Click a hero CTA and wait for it to route. The click is retried until the URL
   * changes: the CTA is an Angular RouterLink whose click is intercepted once
   * hydrated, but an early click on a slow-hydrating engine (webkit) can be
   * swallowed before the router is wired, leaving the URL unchanged.
   */
  async clickCta(label: string, urlPattern: RegExp): Promise<void> {
    // Let hydration settle so the RouterLink is wired before the first click.
    await this.waitForHydrated();
    await expect(async () => {
      await this.cta(label).click();
      await expect(this.page).toHaveURL(urlPattern);
    }).toPass({ timeout: 30_000 });
  }

  /** Assert the hero rendered its core content. */
  async expectHeroVisible(): Promise<void> {
    await expect(this.heroTitle).toBeVisible();
    await expect(this.heroSubtitle).toBeVisible();
    await expect(this.heroCtas.first()).toBeVisible();
  }
}
