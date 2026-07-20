import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Result } from 'axe-core';

/**
 * Automated accessibility scans. We fail the build only on `critical`/`serious`
 * violations — the ones that actually block users — and surface `moderate`/
 * `minor` findings as console warnings so they stay visible without gating CI.
 */

const PAGES: Array<{ name: string; path: string }> = [
  { name: 'home', path: '/' },
  { name: 'projects', path: '/projects' },
  { name: 'about', path: '/about' },
  { name: 'contact', path: '/contact' },
];

/** WCAG 2.1 A/AA is the target conformance level for the portfolio. */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

function summarize(violations: Result[]): string {
  return violations
    .map((v) => `  [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`)
    .join('\n');
}

async function scan(page: Page) {
  return (
    new AxeBuilder({ page })
      .withTags(TAGS)
      // Vercel Analytics/Speed-Insights inject a third-party <script>/pixel we do
      // not control and cannot remediate; exclude it so its markup never fails us.
      .exclude('[src*="_vercel"]')
      .exclude('[src*="vercel-analytics"]')
      .analyze()
  );
}

for (const { name, path } of PAGES) {
  test(`a11y: ${name} page has no serious/critical violations`, async ({ page }) => {
    await page.goto(path);
    // Let hydration settle so scanned attributes reflect the interactive DOM.
    await page.waitForLoadState('networkidle');

    const { violations } = await scan(page);

    const blocking = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    const advisory = violations.filter((v) => v.impact === 'moderate' || v.impact === 'minor');

    if (advisory.length) {
      console.warn(
        `\n[a11y] ${name}: ${advisory.length} non-blocking finding(s):\n${summarize(advisory)}`,
      );
    }

    expect(
      blocking,
      `Serious/critical a11y violations on ${name}:\n${summarize(blocking)}`,
    ).toEqual([]);
  });
}
