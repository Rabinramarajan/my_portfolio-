import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { GlassCard } from '../../ui/glass-card/glass-card';
import { StatItem, accentVar } from '../../../../core';
import { Icon } from '../../ui/icon/icon';

/** Metric tile: accent icon chip + big value + label. Data-driven by StatItem. */
@Component({
  selector: 'app-stats-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, GlassCard],
  templateUrl: './stats-card.html',
  styles: `
    :host {
      display: block;
    }
    .sc {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }
    .sc__icon {
      display: inline-flex;
      height: 2.5rem;
      width: 2.5rem;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      border-radius: 0.625rem;
    }
    .sc__body {
      min-width: 0;
    }
    .sc__value {
      font-size: 1.5rem;
      line-height: 1.75rem;
      font-weight: 700;
      color: var(--color-fg);
      margin: 0;
    }
    .sc__label {
      margin-top: 0.125rem;
      font-size: 0.8125rem;
      color: var(--color-fg-muted);
    }
  `,
})
export class StatsCard {
  readonly stat = input.required<StatItem>();

  protected readonly iconStyle = computed(() => {
    const accent = accentVar(this.stat().accent, 'purple');
    return { color: accent, background: `color-mix(in srgb, ${accent} 14%, transparent)` };
  });
}
