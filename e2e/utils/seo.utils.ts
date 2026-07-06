import type { Page } from '@playwright/test';

/** Read a meta tag's content by name. */
export const metaByName = (page: Page, name: string) =>
  page.locator(`meta[name="${name}"]`).getAttribute('content');

/** Read a meta tag's content by property (og:*). */
export const metaByProperty = (page: Page, property: string) =>
  page.locator(`meta[property="${property}"]`).getAttribute('content');

/** The canonical link href. */
export const canonicalHref = (page: Page) =>
  page.locator('link[rel="canonical"]').getAttribute('href');
