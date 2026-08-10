/**
 * Resolves the origin the build should present as canonical.
 *
 * Every page is prerendered, so `og:url` and `<link rel="canonical">` are baked
 * in at build time — there is no request to derive them from. A preview deploy
 * that inherits the production origin claims to *be* the production page; that
 * is survivable only because Vercel marks previews `noindex`, which is a
 * safeguard we do not control. Resolving per deployment removes the dependency.
 */

/** The custom domain. Used for production and as the offline default. */
export const DEFAULT_ORIGIN = 'https://www.rabinr.in';

export function resolveOrigin(env = process.env) {
  // An explicit setting always wins — it is the escape hatch for self-hosting
  // and for pointing a build at a domain none of the heuristics below know.
  const explicit = env['SITE_URL']?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  // Production keeps the custom domain: `VERCEL_PROJECT_PRODUCTION_URL` reports
  // the deployment's own `*.vercel.app` host, which is not what should be
  // advertised as canonical.
  if (env['VERCEL_ENV'] === 'production') return DEFAULT_ORIGIN;

  // Previews point at themselves, so a shared preview link is self-consistent.
  const vercelUrl = env['VERCEL_URL']?.trim();
  if (vercelUrl) return stripTrailingSlash(`https://${vercelUrl}`);

  return DEFAULT_ORIGIN;
}

function stripTrailingSlash(url) {
  return url.replace(/\/+$/, '');
}
