import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Percentage, AccentColor, accentVar } from '../../../../core';

/** Circular (radial) progress ring with an optional centered value. */
@Component({
  selector: 'app-circular-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './circular-progress.html',
  styles: `
    :host {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .cp {
      position: relative;
    }
    .cp__svg {
      transform: rotate(-90deg);
    }
    .cp__ring {
      transition: stroke-dashoffset 0.7s ease-out;
    }
    .cp__center {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cp__value {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--color-fg);
    }
    .cp__label {
      text-align: center;
      font-size: 0.875rem;
      color: var(--color-fg-muted);
    }
  `,
})
export class CircularProgress {
  readonly value = input.required<Percentage>();
  readonly accent = input<AccentColor>('purple');
  /** Outer diameter in px. */
  readonly size = input(120);
  readonly stroke = input(8);
  readonly label = input<string | null>(null);
  readonly showValue = input(true);

  protected readonly clamped = computed(() => Math.min(100, Math.max(0, this.value())));
  protected readonly radius = computed(() => (this.size() - this.stroke()) / 2);
  protected readonly circumference = computed(() => 2 * Math.PI * this.radius());
  protected readonly dashOffset = computed(
    () => this.circumference() * (1 - this.clamped() / 100),
  );
  protected readonly center = computed(() => this.size() / 2);
  protected readonly strokeColor = computed(() => accentVar(this.accent()));
}
