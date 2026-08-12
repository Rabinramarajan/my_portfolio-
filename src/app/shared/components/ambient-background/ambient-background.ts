import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Ambient page backdrop — CSS/SVG only, no canvas and no JS clock.
 *
 * A fixed, non-interactive layer behind every page made of six cheap planes:
 * a masked grid, three drifting radial glows, abstract architectural outlines,
 * slow geometric lines, two data-flow dashes and a handful of floating dots.
 * Everything animates transform/opacity (or a single tiny dash-offset), on
 * very long durations, so the layer never competes with content and stays
 * compositor-friendly. Reduced motion freezes it into a static wash.
 */
@Component({
  selector: 'app-ambient-background',
  templateUrl: './ambient-background.html',
  styleUrl: './ambient-background.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmbientBackground {}
