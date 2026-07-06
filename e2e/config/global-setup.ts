import type { FullConfig } from '@playwright/test';
import { ENV } from './environments';

/**
 * Global setup — runs once before the whole suite.
 * Logs the resolved environment so every report/CI log states what was tested.
 * Extend here for: auth-state seeding (storageState), test-data provisioning,
 * or warming a remote environment.
 */
export default async function globalSetup(_config: FullConfig): Promise<void> {
  console.log(
    `[e2e] TEST_ENV=${ENV.name} baseURL=${ENV.baseURL} localServer=${ENV.useLocalServer}`,
  );
}
