/**
 * Test data. Slugs mirror public/portfolio-data.json — keep in sync when
 * content changes (or extend to read the JSON directly for full data-driven runs).
 */

export const BLOG_SLUGS = {
  markdownArticle: 'angular-signals-vs-rxjs-enterprise-guide',
} as const;

export const PROJECT_SLUGS = {
  caseStudy: 'fiji-immigration-management-system',
} as const;

export const SITE = {
  titleSuffix: 'Rabin R',
  canonicalHost: /rabinr\.in/,
  resumePdf: '/rabin_resume.pdf',
} as const;

export const CONTACT_FORM = {
  valid: {
    name: 'Playwright Tester',
    email: 'playwright@example.com',
    subject: 'E2E test subject',
    message: 'This is an automated end-to-end test message.',
  },
  invalid: {
    badEmail: 'not-an-email',
    shortSubject: 'abc', // < 5 chars
    shortMessage: 'too short', // < 10 chars
  },
} as const;
