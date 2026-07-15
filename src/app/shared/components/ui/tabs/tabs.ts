import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface TabItem {
  readonly label: string;
  readonly content: string;
}

/** Simple content tabs; active index two-way bound via `active`. */
@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tabs" role="tablist">
      @for (tab of tabs(); track $index; let i = $index) {
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="i === active()"
          class="tabs__tab"
          [class.tabs__tab--active]="i === active()"
          (click)="active.set(i)"
        >
          {{ tab.label }}
        </button>
      }
    </div>
    <div class="tabs__panel" role="tabpanel">
      {{ tabs()[active()]?.content }}
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .tabs {
      display: inline-flex;
      gap: 0.25rem;
      border-radius: 0.5rem;
      border: 1px solid var(--color-border-subtle);
      background: var(--color-surface-glass);
      padding: 0.25rem;
    }
    .tabs__tab {
      border-radius: 0.375rem;
      padding: 0.375rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-fg-muted);
      background: none;
      border: 0;
      cursor: pointer;
      transition: color 0.15s;
    }
    .tabs__tab:hover {
      color: var(--color-fg);
    }
    .tabs__tab--active,
    .tabs__tab--active:hover {
      background: var(--color-brand-purple);
      color: #fff;
    }
    .tabs__panel {
      margin-top: 0.75rem;
      border-radius: 0.75rem;
      border: 1px solid var(--color-border-subtle);
      padding: 1rem;
      font-size: 0.875rem;
      color: var(--color-fg-muted);
    }
  `,
})
export class Tabs {
  readonly tabs = input.required<readonly TabItem[]>();
  readonly active = model(0);
}
