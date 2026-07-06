// ESLint — scoped to the Playwright E2E framework (Angular app code is linted
// by its own toolchain). Run with: npm run e2e:lint
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  {
    files: ['e2e/**/*.ts', 'playwright.config.ts'],
    extends: [...tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
  {
    files: ['e2e/tests/**/*.spec.ts'],
    extends: [playwright.configs['flat/recommended']],
    rules: {
      // Documented known-bug skips are intentional in this suite.
      'playwright/no-skipped-test': 'off',
      'playwright/no-conditional-in-test': 'off',
      'playwright/no-conditional-expect': 'off',
      // networkidle is deliberate: pages render from async JSON and the smoke /
      // visual sweeps must observe the fully-settled page (all requests done).
      'playwright/no-networkidle': 'off',
      'playwright/no-wait-for-timeout': 'warn',
    },
  },
);
