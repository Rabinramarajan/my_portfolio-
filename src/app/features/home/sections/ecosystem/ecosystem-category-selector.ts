import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Reveal } from '../../../../shared/directives/reveal';
import type { EcosystemCategory } from '../../../../core/models/portfolio.models';

/**
 * Minimal editorial category selector for the ecosystem section.
 *
 * Replaces the previous pill-style filter with small uppercase labels and a thin
 * active underline — quieter, more editorial, and consistent with the premium
 * visual language of the rest of the portfolio.
 */
@Component({
  selector: 'app-ecosystem-category-selector',
  imports: [Reveal],
  templateUrl: './ecosystem-category-selector.html',
  styleUrl: './ecosystem-category-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcosystemCategorySelector {
  readonly categories = input.required<readonly EcosystemCategory[]>();
  readonly active = input<EcosystemCategory | null>(null);
  readonly categoryChange = output<EcosystemCategory | null>();

  protected select(category: EcosystemCategory | null): void {
    this.categoryChange.emit(category);
  }
}
