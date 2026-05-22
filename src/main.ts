import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { inject } from '@vercel/analytics';

// Vercel Speed Insights — tracks Core Web Vitals (LCP, FID, CLS, INP, TTFB)
// automatically. No-op in development; only reports in production on Vercel.
injectSpeedInsights();

// Vercel Web Analytics — tracks page views and custom events automatically.
// No-op in development; only reports in production on Vercel.
inject();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

