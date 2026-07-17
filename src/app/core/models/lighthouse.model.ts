/** Lighthouse score metric. */
export interface LighthouseScore {
  readonly id: string;
  readonly date: string;
  readonly overall: number;
  readonly performance: number;
  readonly accessibility: number;
  readonly bestPractices: number;
  readonly seo: number;
  readonly pwa?: number;
  readonly device: 'mobile' | 'desktop';
  readonly url: string;
  readonly timeToFCP?: number;
  readonly timeToDOMContentLoaded?: number;
  readonly timeToLargestContentfulPaint?: number;
}

/** Lighthouse configuration. */
export interface LighthouseConfig {
  readonly scores: LighthouseScore[];
}
