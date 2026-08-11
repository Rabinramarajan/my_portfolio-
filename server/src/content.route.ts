import { Router, type Request, type Response } from 'express';
import { config } from './config.js';
import { CONTENT } from './shared/content/portfolio.content.js';

export const contentRouter = Router();

function setCacheHeaders(res: Response, maxAgeSeconds: number, staleWhileRevalidateSeconds: number): void {
  res.set({
    'Cache-Control': `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
    'ETag': `"${Date.now()}"`,
  });
}

function handleRequest(_req: Request, res: Response, data: unknown, cacheConfig: { maxAge: number; staleWhileRevalidate: number }): void {
  const { maxAge, staleWhileRevalidate } = cacheConfig;
  setCacheHeaders(res, maxAge, staleWhileRevalidate);
  res.json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: config.NODE_ENV === 'production' ? '1.0.0' : 'dev',
    },
  });
}

contentRouter.get('/bundle', (_req: Request, res: Response) => {
  handleRequest(_req, res, CONTENT, { maxAge: 3600, staleWhileRevalidate: 86400 });
});

contentRouter.get('/profile', (_req: Request, res: Response) => {
  handleRequest(_req, res, CONTENT.profile, { maxAge: 3600, staleWhileRevalidate: 86400 });
});

contentRouter.get('/hero', (_req: Request, res: Response) => {
  handleRequest(_req, res, CONTENT.hero, { maxAge: 3600, staleWhileRevalidate: 86400 });
});

contentRouter.get('/about', (_req: Request, res: Response) => {
  handleRequest(_req, res, CONTENT.about, { maxAge: 3600, staleWhileRevalidate: 86400 });
});

contentRouter.get('/availability', (_req: Request, res: Response) => {
  handleRequest(_req, res, CONTENT.availability, { maxAge: 300, staleWhileRevalidate: 3600 });
});

contentRouter.get('/contact', (_req: Request, res: Response) => {
  handleRequest(_req, res, CONTENT.contact, { maxAge: 3600, staleWhileRevalidate: 86400 });
});

contentRouter.get('/site-settings', (_req: Request, res: Response) => {
  handleRequest(_req, res, CONTENT.siteSettings, { maxAge: 3600, staleWhileRevalidate: 86400 });
});

contentRouter.get('/sections', (_req: Request, res: Response) => {
  handleRequest(_req, res, CONTENT.sections, { maxAge: 3600, staleWhileRevalidate: 86400 });
});

contentRouter.get('/ui-copy', (_req: Request, res: Response) => {
  handleRequest(_req, res, CONTENT.uiCopy, { maxAge: 3600, staleWhileRevalidate: 86400 });
});

contentRouter.get('/pricing-plans', (_req: Request, res: Response) => {
  handleRequest(_req, res, CONTENT.pricingPlans, { maxAge: 3600, staleWhileRevalidate: 86400 });
});

contentRouter.get('/media', (_req: Request, res: Response) => {
  handleRequest(_req, res, CONTENT.media, { maxAge: 86400, staleWhileRevalidate: 604800 });
});

contentRouter.get('/services', (_req: Request, res: Response) => {
  handleRequest(_req, res, CONTENT.services, { maxAge: 3600, staleWhileRevalidate: 86400 });
});

contentRouter.get('/projects', (_req: Request, res: Response) => {
  handleRequest(_req, res, CONTENT.projects, { maxAge: 1800, staleWhileRevalidate: 3600 });
});

contentRouter.get('/projects/:slug', (req: Request, res: Response) => {
  const project = CONTENT.projects.find(p => p.slug === req.params.slug);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  handleRequest(req, res, project, { maxAge: 1800, staleWhileRevalidate: 3600 });
});

contentRouter.get('/experience', (_req: Request, res: Response) => {
  handleRequest(_req, res, CONTENT.experience, { maxAge: 3600, staleWhileRevalidate: 86400 });
});

contentRouter.get('/skills', (_req: Request, res: Response) => {
  handleRequest(_req, res, CONTENT.skills, { maxAge: 3600, staleWhileRevalidate: 86400 });
});

contentRouter.get('/process', (_req: Request, res: Response) => {
  handleRequest(_req, res, CONTENT.process, { maxAge: 3600, staleWhileRevalidate: 86400 });
});

contentRouter.get('/testimonials', (_req: Request, res: Response) => {
  handleRequest(_req, res, CONTENT.testimonials, { maxAge: 3600, staleWhileRevalidate: 86400 });
});
