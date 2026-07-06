import type { FullConfig } from '@playwright/test';

/**
 * Global teardown — runs once after the whole suite.
 * Extend here for: test-data cleanup, remote environment release, or
 * pushing custom metrics to a dashboard.
 */
export default async function globalTeardown(_config: FullConfig): Promise<void> {
  // No-op for this project.
}
