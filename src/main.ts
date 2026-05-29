import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { inject as injectAnalytics } from '@vercel/analytics';

// Vercel Analytics — tracks pageviews automatically by hooking into history API
injectAnalytics();

// Vercel Speed Insights — tracks Core Web Vitals (LCP, FID, CLS, INP, TTFB)
// automatically. No-op in development; only reports in production on Vercel.
injectSpeedInsights();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
