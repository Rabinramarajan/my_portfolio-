import { Injectable, isDevMode } from '@angular/core';
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

@Injectable({
  providedIn: 'root',
})
export class WebVitalsService {
  constructor() {
    if (!isDevMode() && typeof window !== 'undefined') {
      this.trackWebVitals();
    }
  }

  private trackWebVitals(): void {
    const trackMetric = (metric: Metric) => {
      if (navigator.sendBeacon) {
        const data = JSON.stringify({
          metric: metric.name,
          value: Math.round(metric.value),
          rating: metric.rating,
        });
        navigator.sendBeacon('/_vercel/insights/event', data);
      }
    };

    onCLS(trackMetric);
    onFCP(trackMetric);
    onLCP(trackMetric);
    onTTFB(trackMetric);
    onINP(trackMetric);
  }
}
