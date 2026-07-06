import type { Locator, Page } from '@playwright/test';

/**
 * Primary navigation (desktop pill nav + mobile hamburger dropdown).
 * Mobile layout engages below 860px (header.scss).
 */
export class HeaderComponent {
  readonly navMenu: Locator;
  readonly toggle: Locator;
  readonly mobileMenu: Locator;
  readonly backdrop: Locator;
  readonly resumeButton: Locator;
  readonly activeLink: Locator;

  constructor(private readonly page: Page) {
    this.navMenu = page.locator('.nav-menu');
    this.toggle = page.locator('.nav-toggle');
    this.mobileMenu = page.locator('.mobile-menu');
    this.backdrop = page.locator('.nav-backdrop');
    this.resumeButton = page.locator('.btn-resume');
    this.activeLink = page.locator('.nav-menu .nav-link--active');
  }

  desktopLink(label: string): Locator {
    return this.page.locator('.nav-menu .nav-link', { hasText: new RegExp(`^${label}$`) });
  }

  mobileLink(label: string): Locator {
    return this.page.locator('.mobile-menu a', { hasText: new RegExp(`^${label}$`) });
  }

  async openMobileMenu(): Promise<void> {
    await this.toggle.click();
  }
}
