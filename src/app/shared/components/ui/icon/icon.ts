import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';
import { ICON_PATHS, AppIconName } from '../../../../core/config/icons.data';

/**
 * Self-contained inline-SVG icon. Replaces the former lucide-angular dependency.
 * Icon geometry lives in the generated `ICON_PATHS` registry; the SVG frame
 * (24x24 viewBox, currentColor stroke) matches Lucide's defaults so `color`
 * set on the host — via `[style.color]` or inherited text color — tints the icon.
 *
 * The geometry is written to the DOM after render rather than through an
 * `[innerHTML]` binding. The server DOM has no `innerHTML` setter, so that
 * binding threw during prerendering and — because a throw halts the update pass
 * — silently cost the rest of the host template its bindings, including the
 * `srcset`/`src` on the hero image. `afterRenderEffect` never runs on the
 * server, so prerendering emits the bare `<svg>` frame and the geometry is
 * filled in on the client. The `<svg>` has no template children on either side,
 * so hydration still matches.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      #svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        line-height: 0;
      }
    `,
  ],
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input<number>(24);

  private readonly svg = viewChild.required<ElementRef<SVGElement>>('svg');

  private readonly inner = computed(() => ICON_PATHS[this.name() as AppIconName] ?? '');

  constructor() {
    // Re-runs when `name` changes. Assigning innerHTML skips sanitization, which
    // is why the source is a compile-time registry of our own markup and never
    // anything user-supplied.
    afterRenderEffect(() => {
      this.svg().nativeElement.innerHTML = this.inner();
    });
  }
}
