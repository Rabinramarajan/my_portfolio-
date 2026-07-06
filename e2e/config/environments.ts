import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Environment configuration.
 *
 * Select the target environment with TEST_ENV (dev | qa | staging | uat | prod).
 * Values are layered: defaults below ← .env ← .env.<TEST_ENV> ← process env.
 *
 * `dev` is the only environment that boots a local `ng serve` (see webServer in
 * playwright.config.ts); every other environment targets a deployed URL and
 * must define BASE_URL in its .env file or the shell.
 */

export type EnvName = 'dev' | 'qa' | 'staging' | 'uat' | 'prod';

export interface EnvConfig {
  name: EnvName;
  baseURL: string;
  /** Whether Playwright should boot the Angular dev server. */
  useLocalServer: boolean;
  /** Extra HTTP headers (e.g. staging basic-auth) — extend per project. */
  extraHTTPHeaders?: Record<string, string>;
}

const ENV_NAME = (process.env.TEST_ENV ?? 'dev') as EnvName;

// Layered .env loading — later loads do NOT override earlier ones in dotenv,
// so load the most specific file first.
dotenv.config({ path: path.resolve(__dirname, `../../.env.${ENV_NAME}`) });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DEFAULT_BASE_URLS: Record<EnvName, string> = {
  dev: 'http://localhost:4200',
  qa: process.env.BASE_URL ?? '',
  staging: process.env.BASE_URL ?? '',
  uat: process.env.BASE_URL ?? '',
  prod: 'https://rabinr.in',
};

function resolveEnv(): EnvConfig {
  const baseURL = process.env.BASE_URL ?? DEFAULT_BASE_URLS[ENV_NAME];
  if (!baseURL) {
    throw new Error(
      `No BASE_URL configured for TEST_ENV="${ENV_NAME}". ` +
        `Set BASE_URL in .env.${ENV_NAME} or the environment.`,
    );
  }
  return {
    name: ENV_NAME,
    baseURL,
    useLocalServer: ENV_NAME === 'dev',
  };
}

export const ENV: EnvConfig = resolveEnv();
