import { injectAxe, checkA11y, getViolations } from 'axe-playwright';
import { Page } from '@playwright/test';

export interface AccessibilityScanResult {
  theme: 'light' | 'dark';
  violations: Array<{ id: string; impact: string; nodes: number }>;
  totalViolations: number;
  timestamp: string;
}

export async function scanAccessibility(
  page: Page,
  theme: 'light' | 'dark' = 'dark'
): Promise<AccessibilityScanResult> {
  // Set color scheme preference via JavaScript (overrides OS setting)
  await page.emulateMedia({ colorScheme: theme });

  // Inject axe-core and run scan
  await injectAxe(page);
  await page.waitForTimeout(500); // Allow theme application

  try {
    const violations = await getViolations(page);
    const summary = violations.map(v => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.length
    }));

    return {
      theme,
      violations: summary,
      totalViolations: violations.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Axe scan failed for ${theme} theme:`, error);
    throw error;
  }
}

export async function scanBothThemes(page: Page): Promise<{
  dark: AccessibilityScanResult;
  light: AccessibilityScanResult;
}> {
  const dark = await scanAccessibility(page, 'dark');
  const light = await scanAccessibility(page, 'light');
  return { dark, light };
}
