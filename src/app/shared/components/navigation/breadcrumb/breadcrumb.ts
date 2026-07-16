import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../ui/icon/icon';

/** "Home / {current}" breadcrumb used across inner pages. */
@Component({
  selector: 'app-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <nav class="bc" aria-label="Breadcrumb">
      <a routerLink="/" class="bc__home">Home</a>
      <app-icon name="ChevronRight" [size]="14" aria-hidden="true" />
      <span class="bc__current" aria-current="page">{{ current() }}</span>
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }
    .bc {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--color-fg-muted);
    }
    .bc__home {
      display: inline-flex;
      align-items: center;
      /* WCAG 2.5.8: keep the tap box at least 24px tall on touch screens. */
      min-height: 1.5rem;
      color: inherit;
      text-decoration: none;
      transition: color 0.15s;
    }
    .bc__home:hover {
      color: var(--color-fg);
    }
    .bc__current {
      color: var(--color-brand-purple);
    }
  `,
})
export class Breadcrumb {
  readonly current = input.required<string>();
}
