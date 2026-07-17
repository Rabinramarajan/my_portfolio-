import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  model,
} from '@angular/core';

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
          #tab
          role="tab"
          [selected]="option === selected()"
          [attr.aria-selected]="option === selected()"
          [attr.tabindex]="option === selected() ? 0 : -1"
          (click)="selected.set(option)"
          (keydown.enter)="handleEnter($event)"
          (keydown.space)="handleSpace($event)"
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
      /* This is a pill, so it only reads correctly as a single row. Wrapping
         turned it into an 84px oval with two rows floating inside it and dead
         curved space at both ends on a phone. Scroll the overflow instead —
         where the options already fit, no scrollbar appears and nothing moves. */
      flex-wrap: nowrap;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scrollbar-width: none;
      align-items: center;
      gap: 0.25rem;
      border-radius: 9999px;
      border: 1px solid var(--color-border-subtle);
      background: var(--color-surface-glass);
      padding: 0.25rem;
    }
    /* The strip is swiped, not dragged by a bar. */
    .tabs::-webkit-scrollbar {
      display: none;
    }
    /* Overflow rather than squash the labels. */
    app-chip {
      flex: 0 0 auto;
    }
  `,
})
export class FilterTabs {
  @ViewChildren('tab') private readonly tabs!: QueryList<ElementRef<HTMLElement>>;

  /** Available options. */
  readonly options = model.required<readonly string[]>();
  /** Currently selected option (two-way bindable). */
  readonly selected = model.required<string>();

  protected readonly trackByValue = trackByValue;

  /** Handle Enter key to select current chip. */
  handleEnter(event: Event): void {
    if (event instanceof KeyboardEvent) {
      event.preventDefault();
      const target = event.target as HTMLElement;
      const chipElement = target.closest('app-chip');
      if (chipElement?.textContent) {
        const option = chipElement.textContent.trim();
        this.selected.set(option);
      }
    }
  }

  /** Handle Space key to select current chip. */
  handleSpace(event: Event): void {
    if (event instanceof KeyboardEvent) {
      event.preventDefault();
      const target = event.target as HTMLElement;
      const chipElement = target.closest('app-chip');
      if (chipElement?.textContent) {
        const option = chipElement.textContent.trim();
        this.selected.set(option);
      }
    }
  }

  /** Move selection by `delta` (with wrap-around) and focus the new tab. */
  move(delta: number, event: Event): void {
    const options = this.options();
    if (!options.length) return;
    const current = options.indexOf(this.selected());
    const next = (current + delta + options.length) % options.length;
    this.moveTo(next, event);
  }

  /** Select the option at `index` and move focus to its tab. */
  moveTo(index: number, event: Event): void {
    const options = this.options();
    const option = options[index];
    if (option === undefined) return;
    event.preventDefault();
    this.selected.set(option);
    // Defer focus until after change detection completes to ensure DOM bindings are updated
    afterNextRender(() => {
      this.tabs?.get(index)?.nativeElement.focus();
    });
  }
}
