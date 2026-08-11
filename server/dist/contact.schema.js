import { z } from 'zod';
/**
 * Server-side contract. Mirrors `src/app/core/models/contact.models.ts`.
 *
 * The client's validation is a convenience; this is the one that counts, so it
 * re-states every rule rather than trusting anything that arrived over the wire.
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
];
export const BUDGET_RANGES = [
    'Under ₹25,000',
    '₹25,000 – ₹50,000',
    '₹50,000 – ₹1,00,000',
    '₹1,00,000 – ₹2,50,000',
    '₹2,50,000 – ₹5,00,000',
    '₹5,00,000+',
    'Not sure yet',
];
export const TIMELINES = [
    'ASAP',
    '1–2 weeks',
    '2–4 weeks',
    '1–2 months',
    '2–3 months',
    'Flexible',
];
export const ADDONS_MAX = 12;
export const contactSchema = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.email().max(160),
    company: z.string().trim().max(120).optional().or(z.literal('')),
    phone: z.string().trim().max(40).optional().or(z.literal('')),
    /** Website / existing product URL — never the honeypot field. */
    url: z.string().trim().max(300).optional().or(z.literal('')),
    /** Selected service from the Hire Me page, e.g. "Premium Website". */
    service: z.string().trim().max(120).optional().or(z.literal('')),
    projectType: z.enum(PROJECT_TYPES),
    budget: z.enum(BUDGET_RANGES),
    timeline: z.enum(TIMELINES).optional(),
    /** Selected add-ons shown as indicative ranges; capped to the published list. */
    addOns: z.array(z.string().trim().min(1).max(80)).max(ADDONS_MAX).default([]),
    message: z.string().trim().min(30).max(3000),
    /** Honeypot: any value at all means a bot filled a field humans cannot see. */
    website: z.string().max(0).optional().or(z.literal('')),
});
/** Flattens Zod issues into the `{ field: message }` shape the client renders. */
export function toFieldErrors(error) {
    const errors = {};
    for (const issue of error.issues) {
        const field = issue.path.join('.') || 'form';
        errors[field] ??= issue.message;
    }
    return errors;
}
//# sourceMappingURL=contact.schema.js.map