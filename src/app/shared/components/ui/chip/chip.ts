import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Selectable pill used by filter tabs / category selectors. */
@Component({
  selector: 'app-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    role: 'button',
    '[attr.tabindex]': '-1',
    class: 'chip',
    '[class.chip--selected]': 'selected()',
    '[attr.aria-pressed]': 'selected()',
  },
  styles: `
    :host {
      display: inline-flex;
      cursor: pointer;
      align-items: center;
      user-select: none;
      border-radius: 9999px;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-fg-muted);
      background: transparent;
      transition: all 0.2s;
    }
    :host(:hover) {
      color: var(--color-fg);
      background: rgb(255 255 255 / 5%);
    }
    :host(.chip--selected) {
      color: #fff;
      background: linear-gradient(135deg, var(--color-brand-purple), var(--color-brand-blue));
      box-shadow: 0 4px 6px -1px color-mix(in srgb, var(--color-brand-purple) 25%, transparent);
    }
    :host(.chip--selected:hover) {
      color: #fff;
      background: linear-gradient(135deg, var(--color-brand-purple), var(--color-brand-blue));
    }
  `,
})
export class Chip {
  readonly selected = input(false);
}
