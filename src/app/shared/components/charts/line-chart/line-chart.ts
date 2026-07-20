import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GrowthPoint, AccentColor, accentVar } from '../../../../core';

/** Reusable SVG line/area chart with x-axis labels and an end-point badge. */
@Component({
  selector: 'app-line-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './line-chart.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .lc__label {
      fill: var(--color-fg-subtle);
      font-size: 9px;
    }
    .lc__badge {
      fill: #fff;
      font-size: 10px;
      font-weight: 600;
    }
  `,
})
export class LineChart {
  readonly points = input.required<readonly GrowthPoint[]>();
  readonly accent = input<AccentColor>('purple');
  readonly width = input(360);
  readonly height = input(200);
  /** Label shown on the final data point (e.g. "500+"). */
  readonly peakLabel = input<string | null>(null);

  private readonly padX = 32;
  private readonly padY = 24;

  private readonly coords = computed(() => {
    const pts = this.points();
    if (pts.length === 0) {
      return [] as { x: number; y: number; label: string }[];
    }
    const max = Math.max(...pts.map((p) => p.value)) || 1;
    const innerW = this.width() - this.padX * 2;
    const innerH = this.height() - this.padY * 2;
    return pts.map((p, i) => ({
      x: this.padX + (innerW * i) / Math.max(1, pts.length - 1),
      y: this.padY + innerH * (1 - p.value / max),
      label: p.label,
    }));
  });

  protected readonly linePath = computed(() =>
    this.coords()
      .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`)
      .join(' '),
  );

  protected readonly areaPath = computed(() => {
    const c = this.coords();
    if (c.length === 0) {
      return '';
    }
    const baseY = this.height() - this.padY;
    const first = c[0];
    const lastPt = c[c.length - 1];
    return (
      `M${first.x},${baseY} ` +
      c.map((p) => `L${p.x},${p.y}`).join(' ') +
      ` L${lastPt.x},${baseY} Z`
    );
  });

  protected readonly dots = this.coords;
  protected readonly last = computed(() => this.coords().at(-1) ?? null);
  protected readonly stroke = computed(() => accentVar(this.accent()));
}
