import { RenderMode, ServerRoute } from '@angular/ssr';

import caseStudies from '../assets/data/case-studies.json';

/**
 * Server render modes. Every route is prerendered to static HTML at build time —
 * there is no server at runtime, and the output deploys as plain files.
 */
export const serverRoutes: ServerRoute[] = [
  {
    // The only parameterised route, so the only one whose URLs cannot be derived
    // from the router alone. The ids are read from the same JSON the page
    // renders from, so adding a case study prerenders it without touching this.
    //
    // Imported rather than read through node:fs so this file needs no Node
    // globals — tsconfig.app.json sets `types: []` to keep them out of the app,
    // and this module is compiled under it alongside the browser code.
    path: 'case-studies/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => caseStudies.items.map(({ id }) => ({ id })),
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
