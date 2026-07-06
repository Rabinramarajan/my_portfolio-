import type { Locator, Page } from '@playwright/test';

/** Global toast notifications (app-toast, bottom-right). */
export class ToastComponent {
  readonly success: Locator;
  readonly error: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.success = page.locator('.toast--success');
    this.error = page.locator('.toast--error');
    this.successMessage = page.locator('.toast--success .toast-message');
    this.errorMessage = page.locator('.toast--error .toast-message');
  }
}
