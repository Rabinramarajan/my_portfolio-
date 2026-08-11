/**
 * ─────────────────────────────────────────────────────────────────────────────
 * HIRE ME — PRICING & PROJECT DISCOVERY CONTENT
 * ─────────────────────────────────────────────────────────────────────────────
 * Contact-page copy: services, packages, add-ons, maintenance plans, FAQ and
 * trust points. Everything is Indian-rupee-priced, "starting from" by design,
 * and never presented as a fixed quotation.
 *
 * All currency follows the INR convention used across the page: ₹75,000,
 * ₹1,00,000, ₹2,50,000 — never "Rs." or a hard-coded USD conversion.
 */

import type { BudgetRange, ProjectType, Timeline } from '../models/contact.models';
import type { PricingPlan } from '../models/portfolio.models';

export const CURRENCY_NOTE =
  'International projects available — USD pricing provided during consultation.';

export const PRICING_DISCLAIMER =
  'Pricing shown is indicative and intended to help with initial budgeting. Final pricing depends on scope, complexity, integrations, timeline, design requirements and ongoing support.';

export const BILLING_DISCLAIMER =
  'Domain, hosting, paid APIs, third-party services, licenses and subscriptions are billed separately unless explicitly included in the proposal.';

export interface HireService {
  readonly index: string;
  readonly title: string;
  readonly for: readonly string[];
  readonly startingFrom: string;
}

export const HIRE_SERVICES: readonly HireService[] = [
  {
    index: '01',
    title: 'Angular Development',
    for: [
      'Enterprise applications',
      'SaaS products',
      'Admin dashboards',
      'Internal platforms',
      'Complex frontend systems',
    ],
    startingFrom: '₹75,000',
  },
  {
    index: '02',
    title: 'Premium Website',
    for: [
      'Business websites',
      'Personal brands',
      'Freelancer websites',
      'Corporate websites',
      'Marketing websites',
    ],
    startingFrom: '₹45,000',
  },
  {
    index: '03',
    title: 'Premium Portfolio',
    for: ['Developers', 'Designers', 'Consultants', 'Founders', 'Creators'],
    startingFrom: '₹35,000',
  },
  {
    index: '04',
    title: 'UI Engineering',
    for: [
      'Figma to Angular',
      'Design systems',
      'Responsive interfaces',
      'Component libraries',
      'UI modernization',
    ],
    startingFrom: '₹40,000',
  },
  {
    index: '05',
    title: 'Dashboard / Admin Portal',
    for: [
      'Analytics dashboards',
      'CRM interfaces',
      'CMS',
      'Internal tools',
      'Enterprise admin systems',
    ],
    startingFrom: '₹1,00,000',
  },
  {
    index: '06',
    title: 'Performance & SSR',
    for: [
      'Angular SSR',
      'Core Web Vitals',
      'Performance optimization',
      'SEO improvements',
      'Architecture improvements',
    ],
    startingFrom: '₹30,000',
  },
  {
    index: '07',
    title: 'API Integration',
    for: ['REST APIs', 'Authentication', 'Payments', 'Third-party APIs', 'Backend integration'],
    startingFrom: '₹25,000',
  },
  {
    index: '08',
    title: 'Custom Web Application',
    for: [
      'SaaS',
      'Business applications',
      'Workflow systems',
      'Custom platforms',
      'Complex web applications',
    ],
    startingFrom: '₹1,50,000',
  },
];

export interface HirePackage {
  readonly id: 'starter' | 'professional' | 'premium';
  readonly name: string;
  readonly priceFrom: string;
  readonly bestFor: string;
  readonly includes: readonly string[];
  readonly timeline: string;
  readonly cta: string;
  readonly badge?: string;
  readonly recommended?: boolean;
}

export const PACKAGES: readonly HirePackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceFrom: '₹35,000+',
    bestFor: 'Individuals, freelancers and small businesses.',
    includes: [
      'Up to 3–5 pages',
      'Responsive design',
      'Custom UI implementation',
      'Angular development',
      'Contact form',
      'Basic SEO',
      'Performance optimization',
      'Deployment assistance',
      '1 revision cycle',
    ],
    timeline: '1–2 weeks',
    cta: 'Choose Starter',
  },
  {
    id: 'professional',
    name: 'Professional',
    priceFrom: '₹75,000+',
    bestFor: 'Growing businesses and professional brands.',
    includes: [
      'Up to 6–10 pages',
      'Custom UI/UX implementation',
      'Angular 22',
      'Signals-based architecture',
      'Responsive design',
      'Advanced animations',
      'Contact form',
      'API integration',
      'SEO optimization',
      'Performance optimization',
      'Analytics integration',
      'Deployment',
      '2 revision cycles',
    ],
    timeline: '2–4 weeks',
    cta: 'Choose Professional',
    badge: 'Most Popular',
    recommended: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    priceFrom: '₹1,50,000+',
    bestFor: 'Companies, startups and high-impact digital products.',
    includes: [
      'Custom UX/UI direction',
      'Angular 22',
      'Signals-first architecture',
      'SSR',
      'Advanced GSAP animations',
      'Three.js/WebGL where appropriate',
      'Premium media integration',
      'Advanced API integration',
      'Authentication where required',
      'SEO architecture',
      'Performance optimization',
      'Accessibility',
      'Playwright testing',
      'Deployment',
      'Technical documentation',
      '3 revision cycles',
    ],
    timeline: '4–8+ weeks',
    cta: 'Discuss Premium Project',
  },
];

export interface HireCustom {
  readonly title: string;
  readonly for: readonly string[];
  readonly price: string;
  readonly cta: string;
}

export const CUSTOM_PROJECT: HireCustom = {
  title: 'Need something more complex?',
  for: [
    'SaaS',
    'Enterprise applications',
    'Admin portals',
    'E-commerce',
    'Custom dashboards',
    'Large-scale Angular applications',
  ],
  price: 'Custom Quote',
  cta: 'Request a Custom Quote',
};

export interface HireAddon {
  readonly label: string;
  readonly range: string;
}

export const ADDONS: readonly HireAddon[] = [
  { label: 'Additional Page', range: '₹5,000 – ₹10,000' },
  { label: 'Advanced Animation', range: '₹10,000 – ₹30,000+' },
  { label: 'Three.js / WebGL Experience', range: '₹25,000 – ₹75,000+' },
  { label: 'Advanced SEO', range: '₹15,000 – ₹35,000' },
  { label: 'CMS Integration', range: '₹20,000 – ₹50,000+' },
  { label: 'API Integration', range: '₹10,000 – ₹30,000+' },
  { label: 'Authentication System', range: '₹20,000 – ₹50,000+' },
  { label: 'Payment Gateway', range: '₹15,000 – ₹35,000+' },
  { label: 'Admin Dashboard', range: '₹40,000 – ₹1,00,000+' },
  { label: 'Performance Optimization', range: '₹15,000 – ₹40,000' },
  { label: 'Playwright E2E Testing', range: '₹20,000 – ₹50,000+' },
  { label: 'Deployment / DevOps Setup', range: '₹10,000 – ₹30,000+' },
];

export interface HireMaintenance {
  readonly name: string;
  readonly price: string;
  readonly includes: readonly string[];
  readonly recommended?: boolean;
}

export const MAINTENANCE_NOTE =
  'Third-party services, hosting, domains, API usage and paid SaaS subscriptions are charged separately.';

export const MAINTENANCE_PLANS: readonly HireMaintenance[] = [
  {
    name: 'Essential',
    price: '₹5,000/month',
    includes: [
      'Minor updates',
      'Dependency updates',
      'Basic monitoring',
      'Small content changes',
      'Bug fixes',
    ],
  },
  {
    name: 'Professional',
    price: '₹10,000/month',
    includes: [
      'Maintenance',
      'Performance monitoring',
      'Dependency updates',
      'Minor feature improvements',
      'Technical support',
      'Priority response',
    ],
    recommended: true,
  },
  {
    name: 'Premium',
    price: '₹20,000+/month',
    includes: [
      'Priority support',
      'Ongoing development',
      'Performance optimization',
      'Security updates',
      'Feature development',
      'Monitoring',
      'Technical consultation',
    ],
  },
];

export interface HireFaq {
  readonly question: string;
  readonly answer: string;
}

export const FAQS: readonly HireFaq[] = [
  {
    question: 'How does your pricing work?',
    answer:
      'Every price on this page is a starting point, not a fixed quotation. Once I understand your scope — screens, integrations, design and timeline — you receive a written proposal with a firm number and a phased plan. There are no hidden line items.',
  },
  {
    question: 'How long does a project take?',
    answer:
      'A starter site ships in 1–2 weeks, a professional build in 2–4 weeks, and premium or complex products in 4–8+ weeks. Timelines are shaped by how much of the scope is design, integration or backend work — we agree a schedule before a single line is written.',
  },
  {
    question: 'Do you provide UI/UX design?',
    answer:
      'Yes. I work in Figma and translate designs into production Angular. For most projects I provide interface direction and a design system; dedicated UI/UX design rounds are available as part of a Professional or Premium package.',
  },
  {
    question: 'Can you work with an existing Angular project?',
    answer:
      'Yes — that is a large part of my work. I take over codebases, modernise legacy Angular, introduce signals and standalone APIs, and raise performance. Tell me the current state and the pain points, and I will give you an honest read on effort.',
  },
  {
    question: 'Do you provide backend/API integration?',
    answer:
      'Yes. I integrate REST APIs end to end — typed models, auth flows, error handling and caching — and can own a Node/Express layer where needed. Heavy backend builds are scoped separately from pure frontend work.',
  },
  {
    question: 'Do you provide hosting and deployment?',
    answer:
      'I handle deployment and DevOps setup for the frontend — CI/CD, static or SSR hosts, environment configuration. Hosting, domains and infrastructure costs are billed separately unless written into the proposal.',
  },
  {
    question: 'Do you provide ongoing maintenance?',
    answer:
      'Yes. After launch you can pick an After Launch plan covering dependency updates, monitoring, bug fixes and small feature work — or continue in an hourly engagement if your needs are irregular.',
  },
  {
    question: 'Can you work with international clients?',
    answer:
      'Yes. I work with teams across time zones and have delivered government and enterprise platforms serving users in three countries. Communication is async-friendly, and project cadence is agreed up front.',
  },
  {
    question: 'What happens after I submit the form?',
    answer:
      'You get an immediate confirmation email with the details we captured. I review your project personally and reply within one business day with questions, a recommended approach and a written proposal.',
  },
];

export interface HireTrustItem {
  readonly label: string;
}

export const TRUST_POINTS: readonly HireTrustItem[] = [
  { label: 'Modern Angular architecture' },
  { label: 'Clean, maintainable code' },
  { label: 'Performance-first development' },
  { label: 'Responsive by default' },
  { label: 'SEO-aware implementation' },
  { label: 'Accessible interfaces' },
  { label: 'Secure integrations' },
  { label: 'Testing with Playwright' },
  { label: 'Clear communication' },
  { label: 'Post-launch support' },
];

/** Strips symbols, commas and suffixes from a labelled INR price, e.g. "₹75,000+" → 75000. */
const priceToNumber = (label: string): number =>
  Number.parseInt(label.replace(/[^\d]/g, ''), 10) || 0;

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PRICING PLANS — structured, single-source pricing the UI renders
 * ─────────────────────────────────────────────────────────────────────────────
 * Derived from the copy blocks above so a figure exists in exactly one place.
 * `price` is the numeric INR value for programmatic display; `priceLabel` is
 * the exact string the page should show. Only `active` plans render.
 */
export const PRICING_PLANS: readonly PricingPlan[] = [
  ...HIRE_SERVICES.map((service, index) => ({
    id: `hire-${service.index.toLowerCase()}`,
    name: service.title,
    description: `Project pricing for ${service.title.toLowerCase()} — starting from ${service.startingFrom}.`,
    currency: 'INR' as const,
    price: priceToNumber(service.startingFrom),
    priceLabel: service.startingFrom,
    priceType: 'starting_from' as const,
    billingType: 'project' as const,
    features: [...service.for],
    order: index + 1,
    active: true,
    updatedAt: '2026-08-01',
    version: 1,
  })),
  ...PACKAGES.map((plan, index) => ({
    id: `package-${plan.id}`,
    name: `${plan.name} Package`,
    description: plan.bestFor,
    currency: 'INR' as const,
    price: priceToNumber(plan.priceFrom),
    priceLabel: plan.priceFrom,
    priceType: 'starting_from' as const,
    billingType: 'project' as const,
    features: [...plan.includes],
    recommended: plan.recommended,
    order: HIRE_SERVICES.length + index + 1,
    active: true,
    updatedAt: '2026-08-01',
    version: 1,
  })),
  ...MAINTENANCE_PLANS.map((plan, index) => ({
    id: `maintenance-${plan.name.toLowerCase()}`,
    name: `${plan.name} Maintenance`,
    description:
      'Ongoing care after launch: dependency updates, monitoring, bug fixes and small feature work.',
    currency: 'INR' as const,
    price: priceToNumber(plan.price),
    priceLabel: plan.price,
    priceType: 'starting_from' as const,
    billingType: 'monthly' as const,
    features: [...plan.includes],
    recommended: plan.recommended,
    order: HIRE_SERVICES.length + PACKAGES.length + index + 1,
    active: true,
    updatedAt: '2026-08-01',
    version: 1,
  })),
  {
    id: 'custom-project',
    name: 'Custom Project',
    description: CUSTOM_PROJECT.title,
    currency: 'INR' as const,
    price: 0,
    priceLabel: CUSTOM_PROJECT.price,
    priceType: 'custom' as const,
    billingType: 'project' as const,
    features: [...CUSTOM_PROJECT.for],
    order: HIRE_SERVICES.length + PACKAGES.length + MAINTENANCE_PLANS.length + 1,
    active: true,
    updatedAt: '2026-08-01',
    version: 1,
  },
];

export interface PackagePreset {
  readonly service: string | null;
  readonly type: ProjectType;
  readonly budget: BudgetRange;
  readonly timeline: Timeline | null;
}

/**
 * The discovery-form presets the "choose a package" cards apply to the form.
 * Kept here (not in the component) so the numbers live in one place.
 */
export const PACKAGE_PRESETS: Record<'starter' | 'professional' | 'premium' | 'custom', PackagePreset> = {
  starter: {
    service: 'Premium Portfolio',
    type: 'Portfolio',
    budget: '₹25,000 – ₹50,000',
    timeline: '1–2 weeks',
  },
  professional: {
    service: 'Angular Development',
    type: 'SaaS',
    budget: '₹50,000 – ₹1,00,000',
    timeline: '2–4 weeks',
  },
  premium: {
    service: 'Custom Web Application',
    type: 'Custom Application',
    budget: '₹1,00,000 – ₹2,50,000',
    timeline: '1–2 months',
  },
  custom: {
    service: null,
    type: 'Custom Application',
    budget: 'Not sure yet',
    timeline: null,
  },
};

export const LOW_BUDGET_NOTE =
  'Not sure about budget? Tell me about the project and I\u2019ll suggest the most practical approach.';
