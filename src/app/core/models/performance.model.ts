/** Performance benchmark metric. */
export interface PerformanceBenchmark {
  readonly id: string;
  readonly date: string;
  readonly metric: string;
  readonly value: number;
  readonly unit: 'ms' | 'KB' | 'MB' | '%' | 'score';
  readonly category: 'load-time' | 'render' | 'memory' | 'network' | 'cpu';
  readonly device: 'mobile' | 'desktop';
  readonly previousValue?: number;
  readonly target?: number;
  readonly status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
}

/** Performance configuration. */
export interface PerformanceConfig {
  readonly benchmarks: PerformanceBenchmark[];
}
