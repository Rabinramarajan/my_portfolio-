/**
 * Fails the build when the content module references a file that is not in
 * `public/`.
 *
 * This exists because of a real failure: `resumeUrl` pointed at a PDF that was
 * never committed, and the deploy's SPA fallback answered the download with the
 * *home page* at 200 — so the résumé button appeared to work while serving the
 * wrong document. Nothing in the build noticed. Now it does.
 *
 *   node tools/verify-assets.mjs
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const contentUrl = new URL('../src/app/core/config/portfolio.content.ts', import.meta.url);
const content = readFileSync(contentUrl, 'utf8');

// Every string literal that looks like a site-root asset path. Query strings and
// fragments are stripped so `?v=2`-style cache busters do not read as missing.
const referenced = [...new Set([...content.matchAll(/'(\/media\/[^']+)'/g)].map((m) => m[1]))]
  .map((path) => path.split(/[?#]/)[0])
  .sort();

const missing = referenced.filter(
  (path) => !existsSync(fileURLToPath(new URL(`../public${path}`, import.meta.url))),
);

if (missing.length) {
  console.error(
    `\n${missing.length} referenced asset${missing.length === 1 ? '' : 's'} missing from public/:\n`,
  );
  for (const path of missing) console.error(`  ${path}`);
  console.error('\nCommit the file, or correct the path in portfolio.content.ts.\n');
  process.exit(1);
}

console.info(`assets ok — ${referenced.length} references resolved`);
