import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

export interface A11yViolationSummary {
  id: string;
  impact: string;
  help: string;
  nodes: number;
}

/**
 * Run an axe scan and return serious/critical violations.
 * WCAG 2.1 A + AA rule sets.
 */
export async function scanForA11yViolations(page: Page): Promise<A11yViolationSummary[]> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  return results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => ({
      id: v.id,
      impact: v.impact ?? 'unknown',
      help: v.help,
      nodes: v.nodes.length,
    }));
}
