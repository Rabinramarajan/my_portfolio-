/**
 * Generates public/sitemap.xml from the route table.
 *
 * The previous sitemap was hand-maintained and had drifted: /services,
 * /certifications and /case-studies shipped without ever being listed. Deriving
 * it from app.routes.ts means a new route can only be missing from the sitemap
 * if it is also missing from the router.
 *
 * Run: npm run sitemap
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROUTES_TS = join(root, 'src/app/app.routes.ts');
const OUT = join(root, 'public/sitemap.xml');

const ORIGIN = 'https://www.rabinr.in';

// Crawl hints per route. Anything routable but absent here still ships, at the
// DEFAULT below — the sitemap's job is completeness, not curation.
const HINTS = {
  '': { changefreq: 'monthly', priority: '1.0' },
  projects: { changefreq: 'monthly', priority: '0.9' },
  'case-studies': { changefreq: 'monthly', priority: '0.9' },
  about: { changefreq: 'monthly', priority: '0.8' },
  experience: { changefreq: 'monthly', priority: '0.8' },
  services: { changefreq: 'monthly', priority: '0.8' },
  skills: { changefreq: 'monthly', priority: '0.7' },
  resume: { changefreq: 'monthly', priority: '0.7' },
  certifications: { changefreq: 'yearly', priority: '0.6' },
  blog: { changefreq: 'weekly', priority: '0.6' },
  contact: { changefreq: 'yearly', priority: '0.6' },
};
const DEFAULT = { changefreq: 'monthly', priority: '0.5' };

/**
 * Pulls `path: '...'` literals out of the routes file. This is a text scan, not
 * a TS parse — app.routes.ts is a flat literal array with no computed paths, so
 * the shapes a parser would buy us do not occur. The guards in main() fail the
 * build if that assumption ever breaks.
 */
function extractPaths(source) {
  const paths = [...source.matchAll(/^\s*path:\s*'([^']*)'/gm)].map((m) => m[1]);

  return paths.filter(
    (p) =>
      p !== '**' && // wildcard 404
      !p.includes(':'), // parameterised (case-studies/:id) — no static URL to list
  );
}

function renderSitemap(paths, lastmod) {
  const urls = paths
    .map((p) => {
      const { changefreq, priority } = HINTS[p] ?? DEFAULT;
      const loc = `${ORIGIN}/${p}`;
      return (
        `  <url>\n` +
        `    <loc>${loc}</loc>\n` +
        `    <lastmod>${lastmod}</lastmod>\n` +
        `    <changefreq>${changefreq}</changefreq>\n` +
        `    <priority>${priority}</priority>\n` +
        `  </url>`
      );
    })
    .join('\n');

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<!-- GENERATED FILE — do not edit by hand. Run \`npm run sitemap\`. -->\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
}

async function main() {
  const source = await readFile(ROUTES_TS, 'utf8');
  const paths = [...new Set(extractPaths(source))];

  // A regex that silently matches nothing would emit a valid, empty sitemap and
  // quietly deindex the site. Both the count and the known-good home route are
  // asserted so a refactor of the routes file fails loudly here instead.
  if (paths.length < 5 || !paths.includes('')) {
    console.error(
      `Refusing to write sitemap: extracted ${paths.length} route(s) from app.routes.ts ` +
        `[${paths.join(', ')}]. The route file's shape likely changed — update extractPaths().`,
    );
    process.exitCode = 1;
    return;
  }

  const lastmod = new Date().toISOString().slice(0, 10);
  await writeFile(OUT, renderSitemap(paths, lastmod));

  console.log(`Wrote ${paths.length} URLs to public/sitemap.xml`);
  for (const p of paths) console.log(`  /${p}`);
}

main();
