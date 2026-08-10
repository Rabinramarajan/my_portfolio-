import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Typing into server-rendered markup before Angular hydrates writes to the DOM
 * without ever reaching the reactive form model, so the submit then fails
 * validation on fields that visibly contain text. The root component stamps
 * `data-hydrated` once the client has taken over, which is the point where
 * input starts sticking to the model.
 */
async function waitForHydration(page: Page): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
}

/**
 * Fills a control and waits for Angular to acknowledge it. `ng-dirty` only
 * appears once the reactive model has taken the value, which makes this a
 * direct assertion that the input landed rather than a guess about timing.
 */
async function fill(field: Locator, value: string): Promise<void> {
  await field.fill(value);
  await expect(field).toHaveClass(/ng-dirty/);
}

async function fillValidForm(page: Page): Promise<void> {
  await waitForHydration(page);
  await fill(page.getByLabel('Name', { exact: false }).first(), 'Dana Okoye');
  await fill(page.getByLabel('Email', { exact: false }).first(), 'dana@example.com');
  await fill(page.getByLabel('Company'), 'Example Ltd');
  await page.getByRole('button', { name: 'Project type: SaaS' }).click();
  await fill(
    page.getByLabel('Project brief', { exact: false }),
    'We are building a SaaS dashboard and need a senior Angular engineer for the frontend.',
  );
}

test.describe('contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await waitForHydration(page);
  });

  test('blocks submission and explains why when fields are empty', async ({ page }) => {
    let requested = false;
    await page.route('**/api/contact', (route) => {
      requested = true;
      return route.abort();
    });

    await page.getByRole('button', { name: /submit inquiry/i }).click();

    await expect(page.getByText(/complete the highlighted fields/i)).toBeVisible();
    await expect(page.getByText(/name is required/i)).toBeVisible();
    expect(requested).toBe(false);
  });

  test('rejects a malformed email address', async ({ page }) => {
    const email = page.getByLabel('Email', { exact: false }).first();
    await fill(email, 'not-an-email');
    await email.blur();
    await expect(page.getByText(/valid email address/i)).toBeVisible();
  });

  test('requires a project brief with enough substance to reply to', async ({ page }) => {
    const message = page.getByLabel('Project brief', { exact: false });
    await fill(message, 'hi');
    await message.blur();
    await expect(page.getByText(/at least 30 characters/i)).toBeVisible();
  });

  test('selecting a project type updates the live summary', async ({ page }) => {
    await page.getByRole('button', { name: 'Project type: Dashboard' }).click();
    await expect(page.getByLabel('Project summary')).toContainText('Dashboard');
  });

  test('submits successfully and resets the form', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Message sent successfully' }),
      }),
    );

    await fillValidForm(page);
    await page.getByRole('button', { name: /submit inquiry/i }).click();

    await expect(page.getByRole('status')).toContainText(/sent successfully/i);
    await expect(page.getByLabel('Name', { exact: false }).first()).toHaveValue('');
  });

  test('surfaces a rate-limit response without losing what was typed', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Too many messages.' }),
      }),
    );

    await fillValidForm(page);
    await page.getByRole('button', { name: /submit inquiry/i }).click();

    await expect(page.getByRole('status')).toContainText(/too many messages/i);
    await expect(page.getByLabel('Name', { exact: false }).first()).toHaveValue('Dana Okoye');
  });

  test('degrades gracefully when the API is unreachable', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.abort('failed'));

    await fillValidForm(page);
    await page.getByRole('button', { name: /submit inquiry/i }).click();

    await expect(page.getByRole('status')).toContainText(/couldn't reach the server|went wrong/i);
    // A failed send must always leave the direct email address in reach.
    await expect(page.getByRole('link', { name: /@/ }).first()).toBeVisible();
  });

  test('keeps the honeypot out of the accessibility tree', async ({ page }) => {
    const honeypot = page.locator('#website');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).not.toBeInViewport();
  });

  /**
   * With `<base href="/">` a bare `href="#section"` resolves against the base
   * URL, so these controls used to navigate to the home page instead of moving
   * down the contact page.
   */
  test('in-page navigation scrolls without leaving the page', async ({ page }) => {
    await page.getByRole('button', { name: /View Services/i }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.locator('#services')).toBeInViewport();

    await page.getByRole('button', { name: /Start a Project/i }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.locator('#start-project')).toBeInViewport();
  });

  test('anchored sections clear the sticky header', async ({ page }) => {
    const headerHeight = await page
      .locator('header.hd')
      .evaluate((el) => el.getBoundingClientRect().height);

    for (const id of ['services', 'pricing', 'start-project', 'faq']) {
      await page.evaluate((target) => document.getElementById(target)?.scrollIntoView(), id);
      const top = await page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top);
      expect(top, `#${id} is hidden behind the header`).toBeGreaterThanOrEqual(headerHeight - 2);
    }
  });

  test('closed add-ons panel collapses completely', async ({ page }) => {
    const panel = page.locator('.ct__accordion-panel');
    expect(await panel.evaluate((el) => el.getBoundingClientRect().height)).toBe(0);

    await page.getByRole('button', { name: /Optional Add-ons/i }).click();
    await expect
      .poll(() => panel.evaluate((el) => el.getBoundingClientRect().height))
      .toBeGreaterThan(100);

    await page.getByRole('button', { name: /Optional Add-ons/i }).click();
    await expect.poll(() => panel.evaluate((el) => el.getBoundingClientRect().height)).toBe(0);
  });

  /**
   * The reveal directive used to set `clip-path: inset(0 0 0 0)` on every
   * revealed element, which clips it to its own border box and silently cut off
   * any child designed to overflow — this badge, for one.
   */
  test('the "most popular" badge is not clipped by its card', async ({ page }) => {
    await page.evaluate(() => document.getElementById('pricing')?.scrollIntoView());
    await page.waitForTimeout(1200);

    const badge = page.locator('.ct__package-badge').first();
    await expect(badge).toBeVisible();

    const { boxHeight, cardClip } = await badge.evaluate((el) => ({
      boxHeight: Math.round(el.getBoundingClientRect().height),
      cardClip: getComputedStyle(el.closest('.ct__package')!).clipPath,
    }));
    expect(cardClip, 'card must not clip its children').toBe('none');
    expect(boxHeight).toBeGreaterThan(20);
  });
});
