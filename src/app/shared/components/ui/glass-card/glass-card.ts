import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AccentColor, accentVar } from '../../../../core';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Frosted glass surface — the base container for every card in the app.
 * Fully configurable via signal inputs; no hardcoded colors (token-driven).
 */
@Component({
  selector: 'app-glass-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    class: 'glass-card',
    '[class]': "'glass-card--pad-' + padding()",
    '[class.glass-card--interactive]': 'interactive()',
    '[style.box-shadow]': 'glowShadow()',
  },
  styles: `
    :host {
      display: block;
      border-radius: var(--radius-card);
      border: 1px solid var(--color-border-subtle);
      background: var(--color-surface-glass);
      backdrop-filter: blur(24px);
      transition: all 0.3s;
    }
    :host(.glass-card--pad-sm) {
      padding: 1rem;
    }
    :host(.glass-card--pad-md) {
      padding: 1.5rem;
    }
    :host(.glass-card--pad-lg) {
      padding: 2rem;
    }
    :host(.glass-card--interactive) {
      cursor: pointer;
    }
    :host(.glass-card--interactive:hover) {
      transform: translateY(-0.25rem);
      border-color: rgb(255 255 255 / 20%);
    }
  `,
})
export class GlassCard {
  /** Inner padding scale. */
  readonly padding = input<CardPadding>('md');

  /** Adds hover lift + border highlight. */
  readonly interactive = input(false);

  /** When set, renders a soft accent glow behind the card. */
  readonly glow = input<AccentColor | null>(null);

  protected readonly glowShadow = computed(() => {
    const g = this.glow();
    return g ? `0 0 40px -12px ${accentVar(g)}` : null;
  });
}
