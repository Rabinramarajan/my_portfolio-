/** Application routes under test. */
export const ROUTES = {
  home: '/',
  blog: '/blog',
  blogDetail: (slug: string) => `/blog/${slug}`,
  projectDetail: (slug: string) => `/projects/${slug}`,
  hireMe: '/hire-me',
  styleguide: '/styleguide',
} as const;

/** Every top-level route, for smoke/a11y sweeps. */
export const ALL_ROUTES: string[] = [
  ROUTES.home,
  ROUTES.blog,
  ROUTES.hireMe,
  ROUTES.styleguide,
];

/** Responsive breakpoints asserted in visual/layout tests. */
export const VIEWPORTS = [
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
] as const;

/** The header switches to the hamburger layout below this width (header.scss). */
export const MOBILE_NAV_BREAKPOINT = 860;

export const TIMEOUTS = {
  animation: 500,
  toast: 7_500,
} as const;
