import { RenderMode, ServerRoute } from '@angular/ssr';

import knowledge from '../assets/data/knowledge.json';
import blogs from '../assets/data/blogs.json';
import projects from '../assets/data/projects.json';

/**
 * Server render modes. Every route is prerendered to static HTML at build time —
 * there is no server at runtime, and the output deploys as plain files.
 */
export const serverRoutes: ServerRoute[] = [
  {
    // Project case studies — one static page per project id in projects.json.
    path: 'projects/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => projects.items.map(({ id }) => ({ slug: id })),
  },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => blogs.posts.map(({ slug }) => ({ slug })),
  },
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
