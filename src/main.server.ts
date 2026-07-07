/**
 * Angular Universal Server Entry Point
 * Handles server-side rendering for static routes
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

const bootstrap = () => bootstrapApplication(App, appConfig);

export default bootstrap;

/**
 * Routes that should be prerendered at build time
 * Excludes dynamic routes (:slug parameters)
 * Dynamic routes (blog/:slug, projects/:slug) are rendered on-demand
 */
export const routes = [
  '/',
  '/hire-me',
  '/blog',
  '/design',
];
