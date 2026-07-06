import type { Page } from '@playwright/test';

export interface ConsoleErrorCollector {
  errors: string[];
}

/**
 * Attach BEFORE page.goto(). Collects console.error and uncaught page errors
 * so tests can assert a clean console.
 */
export function collectConsoleErrors(page: Page): ConsoleErrorCollector {
  const collector: ConsoleErrorCollector = { errors: [] };
  page.on('console', (msg) => {
    if (msg.type() === 'error') collector.errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => collector.errors.push(`pageerror: ${err.message}`));
  return collector;
}
