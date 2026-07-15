import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Icon } from '../../ui/icon/icon';


/** Debounce-free search box with a leading icon, two-way bound via `value`. */
@Component({
  selector: 'app-search-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="search">
      <app-icon name="Search" [size]="18" class="search__icon" aria-hidden="true" />
      <input
        type="search"
        [value]="value()"
        [placeholder]="placeholder()"
        [attr.aria-label]="placeholder()"
        (input)="value.set($any($event.target).value)"
        class="search__field"
      />
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .search {
      position: relative;
      width: 100%;
    }
    .search__icon {
      pointer-events: none;
      position: absolute;
      top: 50%;
      left: 1rem;
      transform: translateY(-50%);
      color: var(--color-fg-subtle);
    }
    .search__field {
      height: 2.75rem;
      width: 100%;
      border-radius: 9999px;
      border: 1px solid var(--color-border-subtle);
      background: var(--color-surface-glass);
      padding: 0 1rem 0 2.75rem;
      font-size: 0.875rem;
      color: var(--color-fg);
      outline: none;
    }
    .search__field::placeholder {
      color: var(--color-fg-subtle);
    }
    .search__field:focus-visible {
      border-color: color-mix(in srgb, var(--color-brand-purple) 50%, transparent);
      outline: 2px solid var(--color-brand-purple);
      outline-offset: 2px;
    }
  `,
})
export class SearchInput {
  readonly value = model('');
  readonly placeholder = input('Search…');
}
