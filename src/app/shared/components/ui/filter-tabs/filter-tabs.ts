import { ChangeDetectionStrategy, Component, model } from '@angular/core';

import { Chip } from '../chip/chip';
import { trackByValue } from '../../../../core';

/**
 * Horizontal filter/segment control. Two-way bound via a model input so pages
 * can drive filtering with a single signal. Keyboard-accessible (chips are
 * focusable buttons).
 */
@Component({
  selector: 'app-filter-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Chip],
  template: `
    <div class="tabs" role="tablist">
      @for (option of options(); track trackByValue($index, option); let i = $index) {
        <app-chip
          role="tab"
          [selected]="option === selected()"
          [attr.aria-selected]="option === selected()"
          [attr.tabindex]="option === selected() ? 0 : -1"
          (click)="selected.set(option)"
          (keydown.enter)="selected.set(option)"
          (keydown.space)="selected.set(option)"
          (keydown.arrowRight)="move(1, $event)"
          (keydown.arrowLeft)="move(-1, $event)"
          (keydown.home)="moveTo(0, $event)"
          (keydown.end)="moveTo(options().length - 1, $event)"
        >
          {{ option }}
        </app-chip>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .tabs {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.25rem;
      border-radius: 9999px;
      border: 1px solid var(--color-border-subtle);
      background: var(--color-surface-glass);
      padding: 0.25rem;
    }
  `,
})
export class FilterTabs {
  /** Available options. */
  readonly options = model.required<readonly string[]>();
  /** Currently selected option (two-way bindable). */
  readonly selected = model.required<string>();

  protected readonly trackByValue = trackByValue;

  /** Move selection by `delta` (with wrap-around) and focus the new tab. */
  protected move(delta: number, event: Event): void {
    const options = this.options();
    if (!options.length) return;
    const current = options.indexOf(this.selected());
    const next = (current + delta + options.length) % options.length;
    this.moveTo(next, event);
  }

  /** Select the option at `index` and move focus to its tab. */
  protected moveTo(index: number, event: Event): void {
    const options = this.options();
    const option = options[index];
    if (option === undefined) return;
    event.preventDefault();
    this.selected.set(option);
    const tabs = (event.currentTarget as HTMLElement).closest('[role="tablist"]');
    tabs?.querySelectorAll<HTMLElement>('[role="tab"]')[index]?.focus();
  }
}
