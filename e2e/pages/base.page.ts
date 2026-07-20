import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Shared behavior for every page object.
 *
 * Console errors are collected from construction time so any spec can assert a
 * page rendered cleanly — important for a zoneless Angular app where a thrown
 * error during change detection won't fail the navigation itself.
 */
export abstract class BasePage {
  /** Route path this page lives at, e.g. '/' or '/contact'. */
  abstract readonly path: string;

  /** The app shell's main content region (present on every route). */
  readonly main: Locator;

  private readonly consoleErrors: string[] = [];

  constructor(readonly page: Page) {
    this.main = page.locator('#main-content');

    page.on('console', (msg) => {
      if (msg.type() === 'error') this.consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => this.consoleErrors.push(err.message));
  }

  /** Navigate to this page's route and wait until it is interactive. */
  async navigateTo(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitForPageReady();
  }

  /** Resolve once the shell has mounted the routed view. */
  async waitForPageReady(): Promise<void> {
    await this.main.waitFor({ state: 'attached' });
    await expect(this.page.locator('body')).toBeVisible();
  }

  /**
   * Wait until Angular has hydrated the server-rendered markup.
   *
   * This app is SSR (`outputMode: static`), so the static DOM is interactable
   * before Angular attaches its event listeners. Any interaction routed through
   * an Angular handler — form `input`, a `<button>` `(click)` — fired before
   * hydration is silently dropped, whereas plain `<a routerLink>` clicks fall
   * back to native navigation and are safe. Page objects whose actions depend on
   * handlers should await this before interacting. `networkidle` is a reliable
   * proxy for hydration completion here; it is deliberately opt-in per page (not
   * in `waitForPageReady`) because it can stall on pages that poll (analytics).
   */
  async waitForHydrated(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /** Console/page errors seen so far. Filtered to drop known third-party noise. */
  getConsoleErrors(): string[] {
    return this.consoleErrors.filter(
      (text) =>
        // Vercel analytics/speed-insights are no-ops without their edge config
        // in a local/CI context and log benign warnings — never product bugs.
        !/vercel|speed-insights|_vercel/i.test(text),
    );
  }

  /** Assert no application console errors were logged on this page. */
  async checkNoConsoleErrors(): Promise<void> {
    expect(this.getConsoleErrors(), 'unexpected console errors').toEqual([]);
  }
}
