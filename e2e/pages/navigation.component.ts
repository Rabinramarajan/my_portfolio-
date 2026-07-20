import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Chrome shared across every route: the sidebar (primary nav + socials on
 * desktop / drawer on mobile) and the mobile top-bar with its hamburger.
 *
 * Not a BasePage — it has no route of its own; it's composed into page objects
 * or used standalone in nav specs.
 */
export class NavigationComponent {
  /** Primary navigation landmark (the sidebar's `<nav aria-label="Primary">`). */
  readonly primaryNav: Locator;
  /** Mobile-only hamburger that opens the sidebar drawer. */
  readonly menuButton: Locator;
  /** Backdrop button that closes the drawer (present only while open). */
  readonly menuBackdrop: Locator;
  /** The sidebar element; gains `--open` when the drawer is showing. */
  readonly sidebar: Locator;
  /** Social links in the sidebar footer (each opens in a new tab). */
  readonly socialLinks: Locator;

  constructor(readonly page: Page) {
    this.primaryNav = page.getByRole('navigation', { name: 'Primary' });
    this.menuButton = page.getByRole('button', { name: 'Open navigation menu' });
    this.menuBackdrop = page.getByRole('button', { name: 'Close navigation menu' });
    this.sidebar = page.locator('.sb');
    this.socialLinks = page.locator('.sb__socials a');
  }

  /** A primary-nav link by its visible label, e.g. 'Projects'. */
  navLink(label: string): Locator {
    return this.primaryNav.getByRole('link', { name: label });
  }

  /**
   * Click a primary-nav link and wait for the URL to settle.
   *
   * The click is retried until it takes: this app is SSR and Angular's RouterLink
   * intercepts the anchor once hydrated, but on slow-hydrating engines (webkit)
   * an early click can be swallowed before the router is wired, leaving the URL
   * unchanged. `toPass` re-issues the click until navigation actually happens.
   */
  async goToSection(label: string, urlPattern: RegExp): Promise<void> {
    // Let hydration settle so the RouterLink is wired before the first click.
    await this.page.waitForLoadState('networkidle');
    await expect(async () => {
      await this.navLink(label).click();
      await expect(this.page).toHaveURL(urlPattern);
    }).toPass({ timeout: 20_000 });
  }

  /**
   * Open the mobile drawer (only meaningful at a mobile viewport). Retried until
   * the drawer's links become visible — the `(click)` handler is dropped if it
   * fires before hydration, so a single tap can silently no-op on webkit.
   */
  async openMobileMenu(): Promise<void> {
    await expect(async () => {
      await this.menuButton.click();
      await expect(this.navLink('Projects')).toBeVisible();
    }).toPass({ timeout: 15_000 });
  }

  /**
   * Close the mobile drawer via its backdrop.
   *
   * The backdrop spans the viewport, but the left-anchored drawer sits above it
   * (higher z-index) and covers the centre on narrow screens, so a default
   * centre-click is intercepted by a drawer link. Click the far-right edge, which
   * the drawer never overlaps.
   */
  async closeMobileMenu(): Promise<void> {
    const box = await this.menuBackdrop.boundingBox();
    if (box) {
      await this.page.mouse.click(box.x + box.width - 4, box.y + box.height / 2);
    } else {
      await this.menuBackdrop.click();
    }
    await expect(this.menuBackdrop).toHaveCount(0);
  }
}
