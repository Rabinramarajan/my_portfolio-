import type { IncomingMessage, ServerResponse } from 'node:http';

import { PRICING_PLANS } from '../src/app/core/config/hire.content';
import {
  ABOUT,
  AVAILABILITY,
  CONTACT,
  EXPERIENCE,
  HERO,
  PROCESS,
  PROFILE,
  PROJECTS,
  SECTIONS,
  SERVICES,
  SITE_MEDIA,
  SITE_SETTINGS,
  SKILLS,
  TESTIMONIALS,
  UI_COPY,
} from '../src/app/core/config/portfolio.content';

/**
 * Production content endpoint (`/api/content`).
 *
 * The site deploys to Vercel as a static prerender, so the Express app under
 * `server/` never ships. This function serves the full portfolio bundle from
 * the single authored source (`src/app/core/config/*`), so the API and the
 * client can never disagree about the content. Clients swap to this via
 * `HttpPortfolioRepository` when they stop shipping the config inline.
 */

const CONTENT = {
  profile: PROFILE,
  projects: PROJECTS,
  services: SERVICES,
  experience: EXPERIENCE,
  skills: SKILLS,
  process: PROCESS,
  testimonials: TESTIMONIALS,
  media: SITE_MEDIA,
  hero: HERO,
  about: ABOUT,
  availability: AVAILABILITY,
  contact: CONTACT,
  siteSettings: SITE_SETTINGS,
  sections: SECTIONS,
  uiCopy: UI_COPY,
  pricingPlans: PRICING_PLANS,
};

const CACHE_SECONDS = 3600;
const STALE_SECONDS = 86_400;

function json(res: ServerResponse, status: number, body: unknown, cache = true): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (cache) {
    res.setHeader(
      'Cache-Control',
      `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}`,
    );
  } else {
    res.setHeader('Cache-Control', 'no-store');
  }
  res.end(JSON.stringify(body));
}

export default async function handler(
  req: IncomingMessage & { method?: string },
  res: ServerResponse,
): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, OPTIONS');
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    json(res, 405, { success: false, message: 'Method not allowed.' }, false);
    return;
  }

  json(res, 200, {
    success: true,
    data: CONTENT,
    meta: { timestamp: new Date().toISOString(), version: '1.0.0' },
  });
}
