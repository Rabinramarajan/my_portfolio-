/**
 * Wire contract shared with the Node/Nodemailer backend.
 * Keep in sync with `server/src/contact.schema.ts`.
 */

export const PROJECT_TYPES = [
  'Website',
  'Portfolio',
  'E-commerce',
  'SaaS',
  'Dashboard',
  'Admin Portal',
  'Mobile App',
  'UI Engineering',
  'Performance / SEO',
  'Custom Application',
  'Other',
] as const;

export const BUDGET_RANGES = [
  'Under ₹25,000',
  '₹25,000 – ₹50,000',
  '₹50,000 – ₹1,00,000',
  '₹1,00,000 – ₹2,50,000',
  '₹2,50,000 – ₹5,00,000',
  '₹5,00,000+',
  'Not sure yet',
] as const;

export const TIMELINES = [
  'ASAP',
  '1–2 weeks',
  '2–4 weeks',
  '1–2 months',
  '2–3 months',
  'Flexible',
] as const;

export const PROJECT_BRIEF_MIN = 30;
export const PROJECT_BRIEF_MAX = 3000;

export type ProjectType = (typeof PROJECT_TYPES)[number];
export type BudgetRange = (typeof BUDGET_RANGES)[number];
export type Timeline = (typeof TIMELINES)[number];

export interface ContactRequest {
  readonly name: string;
  readonly email: string;
  readonly company?: string;
  readonly phone?: string;
  /** Website / existing product URL — optional project context, never the honeypot. */
  readonly url?: string;
  /** Selected service title from the Hire Me page, e.g. "Premium Website". */
  readonly service?: string;
  readonly projectType: ProjectType;
  readonly budget: BudgetRange;
  readonly timeline?: Timeline;
  /** Selected add-ons shown as indicative ranges in the inquiry. */
  readonly addOns: readonly string[];
  readonly message: string;
  /** Honeypot — must be empty. Never shown to real users. */
  readonly website?: string;
}

export interface ContactResponse {
  readonly success: boolean;
  readonly message: string;
  /** Present only on validation failures, keyed by field name. */
  readonly errors?: Readonly<Record<string, string>>;
}

export type SubmissionState = 'idle' | 'validating' | 'submitting' | 'success' | 'error';
