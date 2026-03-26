# Playwright E2E Setup Guide for Angular

This guide provides step-by-step instructions to implement a robust, scalable Playwright end-to-end testing architecture for your Angular portfolio.

## 1. Setup & Installation Commands
Run these inside the Angular root directory (`d:\my_portfolio`):
```bash
npm init playwright@latest
# Follow prompts:
# - Do you want to use TypeScript or JavaScript? TypeScript
# - Where to put your end-to-end tests? e2e
# - Add a GitHub Actions workflow? true
# - Install Playwright browsers? true
```

## 2. Recommended Folder Structure
```
e2e/
 ├── utils/
 │    └── setup.ts          # Global setups, fixture definitions
 ├── pages/
 │    ├── base.page.ts      # Shared page methods
 │    ├── home.page.ts      # Homepage POM
 │    └── contact.page.ts   # Contact POM
 ├── tests/
 │    ├── navigation.spec.ts   
 │    ├── contact.spec.ts   
 │    └── theme.spec.ts     
 ├── playwright.config.ts   # Configuration
```

## 3. `playwright.config.ts` Implementation
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Desktop Safari', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 4. Page Object Model (POM) Structure

`e2e/pages/home.page.ts`:
```typescript
import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heroTitle: Locator;
  readonly themeToggle: Locator;
  readonly contactFormTarget: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroTitle = page.getByRole('heading', { level: 1 });
    this.themeToggle = page.getByRole('button', { name: /toggle dark mode/i });
    this.contactFormTarget = page.locator('#contact');
  }

  async goto() {
    await this.page.goto('/');
  }

  async toggleTheme() {
    await this.themeToggle.click();
  }
}
```

## 5. Full E2E Test Files Example

`e2e/tests/portfolio.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';

test.describe('Angular Portfolio E2E', () => {

  test('should load the homepage and view hero', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.heroTitle).toBeVisible();
  });

  test('should toggle dark/light theme correctly', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    
    // Check initial state (assuming default is light)
    await expect(page.locator('body')).not.toHaveClass(/dark-theme/);
    
    await home.toggleTheme();
    
    // Assert transition to dark theme
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
  });

  test('contact form should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /send message/i }).click();
    
    // Expect Angular form validation text dynamically appearing
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Message cannot be empty')).toBeVisible();
  });

});
```

## 6. Execution Commands
* **Run UI Mode (Interactive):** `npx playwright test --ui`
* **Run Headless:** `npx playwright test`
* **Run specific browser:** `npx playwright test --project=chromium`
* **View HTML Report:** `npx playwright show-report`

## 7. Best Practices to Prevent Flakiness
* **Avoid Implicit Waits:** Do NOT use `page.waitForTimeout(3000)`. Always await state using `await expect(locator).toBeVisible()`.
* **Use Semantic Locators:** Instead of `.btn-primary` or `#submitXYZ`, use `page.getByRole('button', { name: 'Send' })`. It verifies user accessibility and layout resilience.
* **Component Lazy Loading:** Since Angular uses `@defer` and lazy loads routes, assure elements exist before interacting with them.
