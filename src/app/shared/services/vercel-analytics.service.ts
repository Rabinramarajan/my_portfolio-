import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class VercelAnalyticsService {
  private projectId: string | null = null;
  private scriptLoaded = false;

  constructor(private router: Router) {}

  async init() {
    try {
      const res = await fetch('/app.settings.json', { cache: 'no-cache' });
      if (!res.ok) return;
      const cfg = await res.json();
      this.projectId = cfg?.vercelAnalyticsProjectId || null;
      if (!this.projectId) return;

      // Load Vercel Insights script (best-effort). Use a safe wrapper so missing API is no-op.
      if (!this.scriptLoaded) {
        const s = document.createElement('script');
        s.src = `https://static.vercel-insights.com/v1/script.js`; // Vercel will try to auto-detect project when hosted on Vercel
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
        this.scriptLoaded = true;
      }

      // Track initial page load
      this.trackPage(window.location.pathname + window.location.search);

      // Subscribe to route changes
      this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: any) => {
        this.trackPage(e.urlAfterRedirects || e.url || window.location.pathname);
      });
    } catch (err) {
      // Fail silently — analytics should never break the app
      console.warn('VercelAnalytics init failed', err);
    }
  }

  private trackPage(path: string) {
    try {
      // If the Vercel script registers a global collector, call it safely.
      const w: any = window as any;
      if (w && typeof w.__vercel_analytics === 'function') {
        w.__vercel_analytics('pageview', { path });
        return;
      }

      // Fallback: send a visibility beacon to the Insights endpoint if available
      if (navigator.sendBeacon && this.projectId) {
        const url = `https://static.vercel-insights.com/v1/collect`;
        const payload = JSON.stringify({ projectId: this.projectId, path, ts: Date.now() });
        navigator.sendBeacon(url, payload);
      }
    } catch (err) {
      // swallow errors
    }
  }
}
