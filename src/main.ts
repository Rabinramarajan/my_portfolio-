import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { VercelAnalyticsService } from './app/shared/services/vercel-analytics.service';

// Vercel Speed Insights — tracks Core Web Vitals (LCP, FID, CLS, INP, TTFB)
// automatically. No-op in development; only reports in production on Vercel.
injectSpeedInsights();

bootstrapApplication(App, appConfig)
  .then(async (ref) => {
    // Initialize Vercel Analytics (non-blocking)
    try {
      // Use the injector to get Router and start the analytics service
      const injector = (ref as any).injector;
      const analytics = injector.get(VercelAnalyticsService as any) as VercelAnalyticsService;
      if (analytics && typeof analytics.init === 'function') analytics.init();
    } catch (e) {
      // ignore
    }
  })
  .catch((err) => console.error(err));

