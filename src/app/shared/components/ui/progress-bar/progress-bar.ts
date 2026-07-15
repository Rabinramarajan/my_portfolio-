import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Percentage, AccentColor, accentVar } from '../../../../core';

/** Gradient linear progress track with an accessible role="progressbar". */
@Component({
  selector: 'app-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
  host: { class: 'progress' },
})
export class ProgressBar {
  readonly value = input.required<Percentage>();
  readonly accent = input<AccentColor>('purple');
  /** Track thickness as a CSS length. */
  readonly height = input('0.5rem');
  /** Optional label rendered above the track. */
  readonly label = input<string | null>(null);
  readonly showValue = input(true);

  protected readonly clamped = computed(() => Math.min(100, Math.max(0, this.value())));

  protected readonly fillStyle = computed(() => ({
    width: `${this.clamped()}%`,
    background: `linear-gradient(90deg, ${accentVar(this.accent())}, var(--color-brand-blue))`,
  }));
}
