import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { GradientTitle } from '../../ui/gradient-title/gradient-title';
import { Breadcrumb } from '../../navigation/breadcrumb/breadcrumb';

/**
 * Standard inner-page frame: breadcrumb, gradient heading, subtitle and a
 * flexible header-aside slot ([slot=header-aside]) plus the main content.
 * Keeps every feature page visually consistent with zero duplication.
 */
@Component({
  selector: 'app-page-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GradientTitle, Breadcrumb],
  templateUrl: './page-layout.html',
  styles: `
    :host {
      display: block;
    }
    .pl__crumb {
      display: block;
      margin-bottom: 1.5rem;
    }
    .pl__header {
      margin-bottom: 2.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .pl__head-main {
      max-width: 42rem;
    }
    .pl__bar {
      margin-top: 1rem;
      height: 0.25rem;
      width: 4rem;
      border-radius: 9999px;
      background: linear-gradient(90deg, var(--color-brand-purple), var(--color-brand-blue));
    }
    .pl__subtitle {
      margin-top: 1.25rem;
      font-size: 1rem;
      line-height: 1.625;
      color: var(--color-fg-muted);
    }
    .pl__aside {
      flex-shrink: 0;
    }
    @media (min-width: 1024px) {
      .pl__header {
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
      }
    }
  `,
})
export class PageLayout {
  /** Current page label shown after "Home /". */
  readonly breadcrumb = input.required<string>();
  readonly titleLead = input.required<string>();
  readonly titleHighlight = input('');
  readonly subtitle = input<string | null>(null);
}
