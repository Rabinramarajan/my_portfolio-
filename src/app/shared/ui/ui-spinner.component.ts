import { Component, input, ChangeDetectionStrategy } from '@angular/core';

/**
 * Design-system loading spinner.
 * Usage: <ui-spinner /> · <ui-spinner [size]="24" />
 */
@Component({
  selector: 'ui-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: {
    class: 'ui-spinner',
    role: 'status',
    'aria-label': 'Loading',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
  styles: [`
    :host {
      display: inline-block;
      border-radius: 50%;
      border: 2px solid rgba(99, 102, 241, 0.25);
      border-top-color: var(--accent-primary);
      animation: ui-spin 0.7s linear infinite;
    }
    @keyframes ui-spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) {
      :host { animation-duration: 1.4s; }
    }
  `],
})
export class UiSpinnerComponent {
  readonly size = input(15);
}
