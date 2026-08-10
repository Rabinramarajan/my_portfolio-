import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Sticky visual companion to the process timeline. Renders a distinct SVG
 * composition per active step rather than a single reused illustration —
 * the point is that each stage of the journey should *look* different.
 */
@Component({
  selector: 'app-process-visual',
  templateUrl: './process-visual.html',
  styleUrl: './process-visual.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pv', '[attr.aria-hidden]': 'true' },
})
export class ProcessVisual {
  /** Zero-based index of the currently active process step (0–6). */
  readonly activeStep = input(0);

  protected readonly key = computed(() => VISUAL_KEYS[this.activeStep()] ?? VISUAL_KEYS[0]);
}

export const VISUAL_KEYS = [
  'discover',
  'define',
  'design',
  'build',
  'test',
  'launch',
  'evolve',
] as const;

export type VisualKey = (typeof VISUAL_KEYS)[number];
