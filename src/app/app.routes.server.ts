import { RenderMode, ServerRoute } from '@angular/ssr';

import knowledge from '../assets/data/knowledge.json';

/**
 * Server render modes. Every route is prerendered to static HTML at build time —
 * there is no server at runtime, and the output deploys as plain files.
 */
export const serverRoutes: ServerRoute[] = [
  {
    // Knowledge Hub entries — slugs come from the same JSON the detail page
    // renders from, so adding an entry prerenders it without touching this.
    //
    // Imported rather than read through node:fs so this file needs no Node
    // globals — tsconfig.app.json sets `types: []` to keep them out of the app,
    // and this module is compiled under it alongside the browser code.
    path: 'knowledge/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => knowledge.entries.map(({ slug }) => ({ slug })),
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
