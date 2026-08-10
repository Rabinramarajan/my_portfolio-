import { PROFILE, SITE_URL } from '../config/portfolio.content';
import type { PortfolioProject } from '../models/portfolio.models';

/** JSON-LD builders. Pure functions — trivially unit-testable, no DI needed. */

export function personSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PROFILE.name,
    jobTitle: PROFILE.role,
    description: PROFILE.valueProposition,
    email: `mailto:${PROFILE.email}`,
    url: SITE_URL,
    image: `${SITE_URL}/media/og/default.png`,
    address: { '@type': 'PostalAddress', addressLocality: PROFILE.location },
    worksFor: {
      '@type': 'Organization',
      name: 'RSTACK Solutions Private Limited',
    },
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'National College, Tiruchirappalli',
    },
    sameAs: PROFILE.socials.filter((s) => s.url.startsWith('http')).map((s) => s.url),
    knowsAbout: [
      'Angular',
      'Angular 22',
      'TypeScript',
      'RxJS',
      'Signals',
      'Ionic',
      'Capacitor',
      'Frontend Architecture',
      'Web Performance',
      'Accessibility',
      'Server-Side Rendering',
      'Standalone Components',
      'Zoneless Angular',
      'Progressive Web Apps',
      'REST APIs',
      'SCSS',
      'Tailwind CSS',
    ],
  };
}

export function websiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${PROFILE.name} — ${PROFILE.role}`,
    url: SITE_URL,
    description:
      'Portfolio of Rabin R, a Senior Frontend Angular Developer specializing in enterprise-grade Angular applications, TypeScript, RxJS, and cross-platform mobile development.',
    inLanguage: 'en',
  };
}

export function professionalServiceSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `${PROFILE.name} — ${PROFILE.role}`,
    description: PROFILE.valueProposition,
    url: SITE_URL,
    email: `mailto:${PROFILE.email}`,
    areaServed: 'Worldwide',
    serviceType: 'Frontend engineering consultancy',
  };
}

export function projectSchema(project: PortfolioProject): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    headline: project.tagline,
    description: project.summary,
    url: `${SITE_URL}/work/${project.slug}`,
    dateCreated: String(project.year),
    creator: { '@type': 'Person', name: PROFILE.name, url: SITE_URL },
    keywords: project.technologies.join(', '),
    image: `${SITE_URL}${project.hero.src}`,
  };
}

/**
 * BreadcrumbList schema for nested pages. Provides Google with the navigation
 * path so it can display breadcrumbs in search results.
 */
export function breadcrumbSchema(
  items: readonly { name: string; url: string }[],
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function homeSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@graph': [personSchema(), websiteSchema(), professionalServiceSchema()],
  };
}
