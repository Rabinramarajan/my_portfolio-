import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { AnimatedCounter } from '../../../../../shared/components/animated-counter/animated-counter';

export interface HeroMetric {
  readonly value: number;
  readonly suffix: string;
  readonly label: string;
}

/**
 * Compact credibility row under the hero statement. Counts animate once when
 * scrolled into view; the numbers themselves are verified content, never
 * invented, and the counter never runs more than once.
 */
@Component({
  selector: 'app-hero-metrics',
  standalone: true,
  imports: [AnimatedCounter],
  template: `
    <div class="hero-metrics">
      @for (metric of metrics(); track metric.label) {
        <div class="hero-metrics__item">
          <app-animated-counter
            [value]="metric.value"
            [suffix]="metric.suffix"
            [label]="metric.label"
          />
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .hero-metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
      }

      .hero-metrics__item {
        padding: 0.4rem 1rem;
        border-inline-start: 1px solid rgba(255, 255, 255, 0.08);

        &:first-child {
          border-inline-start: 0;
          padding-inline-start: 0;
        }
      }

      @media (max-width: 767.98px) {
        .hero-metrics__item {
          padding: 0.3rem 0.6rem;
        }
      }

      @media (max-width: 479.98px) {
        .hero-metrics {
          gap: 0.25rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroMetrics {
  readonly metrics = input.required<readonly HeroMetric[]>();
}