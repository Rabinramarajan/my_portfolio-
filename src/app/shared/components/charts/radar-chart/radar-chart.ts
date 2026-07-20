import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RadarAxis } from '../../../../core';

interface Point {
  readonly x: number;
  readonly y: number;
}
interface AxisPoint extends Point {
  readonly label: string;
  readonly labelX: number;
  readonly labelY: number;
  readonly anchor: 'start' | 'middle' | 'end';
}

/** Reusable SVG radar/polygon chart driven by an axis array. */
@Component({
  selector: 'app-radar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './radar-chart.html',
  styles: `
    :host {
      display: block;
    }
    .radar__label {
      fill: var(--color-fg-muted);
      font-size: 10px;
    }
  `,
})
export class RadarChart {
  readonly axes = input.required<readonly RadarAxis[]>();
  readonly size = input(280);
  /** Concentric grid ring fractions. */
  readonly rings = input<readonly number[]>([0.25, 0.5, 0.75, 1]);

  private readonly center = computed(() => this.size() / 2);
  private readonly radius = computed(() => this.size() / 2 - 44);

  /** Angle (radians) for axis i, starting at the top. */
  private angle(i: number, count: number): number {
    return -Math.PI / 2 + (i * 2 * Math.PI) / count;
  }

  private pointAt(i: number, count: number, r: number): Point {
    const a = this.angle(i, count);
    return { x: this.center() + r * Math.cos(a), y: this.center() + r * Math.sin(a) };
  }

  /** Data polygon points ("x,y x,y ..."). */
  protected readonly dataPoints = computed(() => {
    const axes = this.axes();
    return axes
      .map((axis, i) => {
        const p = this.pointAt(i, axes.length, (axis.value / 100) * this.radius());
        return `${p.x},${p.y}`;
      })
      .join(' ');
  });

  /** Grid ring polygons. */
  protected readonly gridRings = computed(() => {
    const count = this.axes().length;
    return this.rings().map((frac) =>
      Array.from({ length: count }, (_, i) => {
        const p = this.pointAt(i, count, frac * this.radius());
        return `${p.x},${p.y}`;
      }).join(' '),
    );
  });

  /** Axis spokes + labels. */
  protected readonly axisPoints = computed<readonly AxisPoint[]>(() => {
    const axes = this.axes();
    return axes.map((axis, i) => {
      const outer = this.pointAt(i, axes.length, this.radius());
      const label = this.pointAt(i, axes.length, this.radius() + 22);
      const dx = label.x - this.center();
      const anchor = Math.abs(dx) < 8 ? 'middle' : dx > 0 ? 'start' : 'end';
      return { ...outer, label: axis.axis, labelX: label.x, labelY: label.y, anchor };
    });
  });

  protected readonly cx = this.center;
}
