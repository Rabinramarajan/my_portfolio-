import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICON_PATHS, AppIconName } from '../../../../core/config/icons.data';

/**
 * Self-contained inline-SVG icon. Replaces the former lucide-angular dependency.
 * Icon geometry lives in the generated `ICON_PATHS` registry; the SVG frame
 * (24x24 viewBox, currentColor stroke) matches Lucide's defaults so `color`
 * set on the host — via `[style.color]` or inherited text color — tints the icon.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      [innerHTML]="inner()"
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
  private readonly sanitizer = inject(DomSanitizer);

  readonly name = input.required<string>();
  readonly size = input<number>(24);

  protected readonly inner = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(ICON_PATHS[this.name() as AppIconName] ?? ''),
  );
}
