import { test } from '@playwright/test';

/**
 * Placeholder — the portfolio has no floating WhatsApp widget component.
 * `wa.me`/`whatsapp` appears only in build scripts and the social-platform
 * model type, never as a rendered widget. These are kept skipped so the
 * intended coverage is documented; unskip and fill in once a widget exists.
 */
test.describe('WhatsApp Widget', () => {
  test.skip('renders and opens a wa.me link with prefilled text', () => {
    // No widget in the codebase yet — see e2e notes / Prompt 3 summary.
  });
});
