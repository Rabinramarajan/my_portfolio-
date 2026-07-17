/** Core Web Vital metric. */
export interface CoreWebVital {
  readonly id: string;
  readonly name: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP' | 'INP';
  readonly value: number;
  readonly unit: 'ms' | 's' | 'score';
  readonly rating: 'good' | 'needs-improvement' | 'poor';
  readonly threshold: {
    readonly good: number;
    readonly poor: number;
  };
  readonly description: string;
  readonly optimization?: string;
}

/** Web Vital metric over time. */
export interface WebVitalMetric {
  readonly id: string;
  readonly date: string;
  readonly vitals: CoreWebVital[];
  readonly device: 'mobile' | 'desktop';
  readonly url: string;
}

/** Web Vitals configuration. */
export interface WebVitalsConfig {
  readonly metrics: WebVitalMetric[];
}
