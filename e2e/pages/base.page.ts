import type { Locator, Page } from '@playwright/test';
import { HeaderComponent } from '../components/header.component';
import { FooterComponent } from '../components/footer.component';
import { ToastComponent } from '../components/toast.component';

/**
 * Base page object. Every page shares the app shell: header, footer, toast,
 * back-to-top, WhatsApp widget, skip link.
 */
export abstract class BasePage {
  readonly header: HeaderComponent;
  readonly footer: FooterComponent;
  readonly toast: ToastComponent;
  readonly backToTop: Locator;
  readonly whatsappWidget: Locator;
  readonly skipLink: Locator;
  readonly h1: Locator;

  protected abstract readonly path: string;

  constructor(readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.footer = new FooterComponent(page);
    this.toast = new ToastComponent(page);
    this.backToTop = page.locator('app-back-to-top button, app-back-to-top a').first();
    this.whatsappWidget = page.locator('app-whatsapp-widget a').first();
    this.skipLink = page.locator('.skip-to-main');
    this.h1 = page.locator('h1').first();
  }

  async goto(options?: Parameters<Page['goto']>[1]): Promise<void> {
    await this.page.goto(this.path, options);
  }

  /** Scroll an in-page section into the viewport centre. */
  async centerSection(id: string): Promise<void> {
    await this.page.locator(`#${id}`).evaluate((el) => el.scrollIntoView({ block: 'center' }));
  }
}
