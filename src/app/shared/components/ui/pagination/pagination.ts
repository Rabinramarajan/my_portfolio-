import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { Icon } from '../icon/icon';


/** Numeric pagination; current page two-way bound via `page` (1-indexed). */
@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <nav class="pg" aria-label="Pagination">
      <button
        type="button"
        class="pg__btn"
        [disabled]="page() === 1"
        aria-label="Previous page"
        (click)="go(page() - 1)"
      >
        <app-icon name="ChevronLeft" [size]="16" aria-hidden="true" />
      </button>

      @for (p of pages(); track p) {
        <button
          type="button"
          class="pg__btn"
          [class.pg__btn--active]="p === page()"
          [attr.aria-current]="p === page() ? 'page' : null"
          (click)="go(p)"
        >
          {{ p }}
        </button>
      }

      <button
        type="button"
        class="pg__btn"
        [disabled]="page() === total()"
        aria-label="Next page"
        (click)="go(page() + 1)"
      >
        <app-icon name="ChevronRight" [size]="16" aria-hidden="true" />
      </button>
    </nav>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    .pg {
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }
    .pg__btn {
      display: inline-flex;
      height: 2.25rem;
      width: 2.25rem;
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      border: 1px solid var(--color-border-subtle);
      color: var(--color-fg-muted);
      background: none;
      cursor: pointer;
      transition: color 0.15s;
    }
    .pg__btn:hover {
      color: var(--color-fg);
    }
    .pg__btn:disabled {
      opacity: 0.4;
    }
    .pg__btn--active,
    .pg__btn--active:hover {
      background: var(--color-brand-purple);
      color: #fff;
      border-color: transparent;
    }
  `,
})
export class Pagination {
  readonly total = input.required<number>();
  readonly page = model(1);

  protected readonly pages = computed(() =>
    Array.from({ length: this.total() }, (_, i) => i + 1),
  );

  protected go(p: number): void {
    if (p >= 1 && p <= this.total()) {
      this.page.set(p);
    }
  }
}
