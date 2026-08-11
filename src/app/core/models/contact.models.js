"use strict";
/**
 * Wire contract shared with the Node/Nodemailer backend.
 * Keep in sync with `server/src/contact.schema.ts`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROJECT_BRIEF_MAX = exports.PROJECT_BRIEF_MIN = exports.TIMELINES = exports.BUDGET_RANGES = exports.PROJECT_TYPES = void 0;
exports.PROJECT_TYPES = [
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
exports.BUDGET_RANGES = [
    'Under ₹25,000',
    '₹25,000 – ₹50,000',
    '₹50,000 – ₹1,00,000',
    '₹1,00,000 – ₹2,50,000',
    '₹2,50,000 – ₹5,00,000',
    '₹5,00,000+',
    'Not sure yet',
];
exports.TIMELINES = [
    'ASAP',
    '1–2 weeks',
    '2–4 weeks',
    '1–2 months',
    '2–3 months',
    'Flexible',
];
exports.PROJECT_BRIEF_MIN = 30;
exports.PROJECT_BRIEF_MAX = 3000;
//# sourceMappingURL=contact.models.js.map