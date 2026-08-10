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
    address: { '@type': 'PostalAddress', addressLocality: PROFILE.location },
    sameAs: PROFILE.socials.filter((s) => s.url.startsWith('http')).map((s) => s.url),
    knowsAbout: [
      'Angular',
      'TypeScript',
      'Frontend Architecture',
      'Web Performance',
      'Accessibility',
    ],
  };
}

export function websiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${PROFILE.name} — ${PROFILE.role}`,
    url: SITE_URL,
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

export function homeSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@graph': [personSchema(), websiteSchema(), professionalServiceSchema()],
  };
}
