import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Performance monitoring - track web vitals
if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
  try {
    // Monitor Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (typeof window !== 'undefined') {
        (window as any).__LCP__ = ((lastEntry as any).renderTime || (lastEntry as any).loadTime || lastEntry.startTime);
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor First Input Delay (FID) and Interaction to Next Paint (INP)
    const fidObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (typeof window !== 'undefined') {
          (window as any).__FID__ = ((entry as any).processingDuration || 0);
        }
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    // Ignore observer setup errors in older browsers
  }
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

