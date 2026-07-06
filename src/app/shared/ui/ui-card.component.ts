import { Component, input, ChangeDetectionStrategy } from '@angular/core';

/**
 * Design-system surface card. Projects arbitrary content.
 * Usage: <ui-card>…</ui-card> · <ui-card [interactive]="true">…</ui-card>
 */
@Component({
  selector: 'ui-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    class: 'ui-card',
    '[class.ui-card--interactive]': 'interactive()',
  },
  styles: [`
    :host {
      display: block;
      padding: 24px;
      background: var(--gradient-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
    }
    :host(.ui-card--interactive) {
      transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
    }
    :host(.ui-card--interactive:hover) {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: var(--border-active);
    }
  `],
})
export class UiCardComponent {
  readonly interactive = input(false);
}
