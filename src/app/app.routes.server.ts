import { RenderMode, ServerRoute } from '@angular/ssr';

import { PROJECTS } from './core/config/portfolio.content';

/**
 * The whole site is static content, so everything prerenders — including one
 * page per project, enumerated from the same content module the app renders
 * from, so a new project can never be silently left out of the build.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'work/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => PROJECTS.map((project) => ({ slug: project.slug })),
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
