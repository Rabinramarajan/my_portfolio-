/** Bundle size metric. */
export interface BundleMetric {
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly gzippedSize: number;
  readonly type: 'chunk' | 'vendor' | 'shared' | 'lazy' | 'main';
  readonly modules?: number;
  readonly percentage: number;
}

/** Bundle comparison. */
export interface BundleComparison {
  readonly id: string;
  readonly version: string;
  readonly date: string;
  readonly totalSize: number;
  readonly totalGzipped: number;
  readonly metrics: BundleMetric[];
  readonly trend?: 'up' | 'down' | 'stable';
  readonly changePercent?: number;
}

/** Bundle size configuration. */
export interface BundleSizeConfig {
  readonly comparisons: BundleComparison[];
}
