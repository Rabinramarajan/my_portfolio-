/** Canonical route path segments (single source of truth for links & router). */
export const ROUTE_PATHS = {
  home: '',
  about: 'about',
  experience: 'experience',
  projects: 'projects',
  skills: 'skills',
  resume: 'resume',
  contact: 'contact',
  blog: 'blog',
  notFound: '404',
} as const;

export type RouteId = keyof typeof ROUTE_PATHS;
