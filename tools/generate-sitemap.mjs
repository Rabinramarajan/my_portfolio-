/**
 * Generates `public/sitemap.xml` from the same route list the app renders.
 *
 * Run before `ng build` so the sitemap can never drift from the real routes —
 * a hand-maintained sitemap is a promise you forget to keep.
 *
 *   node tools/generate-sitemap.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

import { resolveOrigin } from './site-origin.mjs';

const content = readFileSync(
  new URL('../src/app/core/config/portfolio.content.ts', import.meta.url),
  'utf8',
);

// The same resolution the app is built with, so the sitemap, robots.txt and
// every canonical tag always name one origin.
const origin = resolveOrigin();

const slugs = [...content.matchAll(/^\s{4}slug:\s*'([^']+)'/gm)].map((match) => match[1]);

const routes = [
  { path: '/', priority: '1.0', changefreq: 'monthly' },
  { path: '/work', priority: '0.9', changefreq: 'monthly' },
  { path: '/resume', priority: '0.6', changefreq: 'yearly' },
  { path: '/contact', priority: '0.8', changefreq: 'yearly' },
  ...slugs.map((slug) => ({ path: `/work/${slug}`, priority: '0.8', changefreq: 'yearly' })),
];

const today = new Date().toISOString().slice(0, 10);
const urls = routes
  .map(
    ({ path, priority, changefreq }) => `  <url>
    <loc>${origin}${path === '/' ? '/' : path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  )
  .join('\n');

writeFileSync(
  new URL('../public/sitemap.xml', import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
);

// robots.txt names the sitemap absolutely, so it has to move with the origin —
// a preview pointing crawlers at the production sitemap defeats the exercise.
writeFileSync(
  new URL('../public/robots.txt', import.meta.url),
  `User-agent: *
Allow: /
Disallow: /404

Sitemap: ${origin}/sitemap.xml
`,
);

console.info(`sitemap.xml written with ${routes.length} routes for ${origin}`);
