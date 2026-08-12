import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Reveal } from '../../../../shared/directives/reveal';
import { CATEGORY_DESCRIPTIONS } from '../../../../core/config/portfolio.content';
import type { CategoryDescription, EcosystemCategory } from '../../../../core/models/portfolio.models';

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

  private readonly descriptions = CATEGORY_DESCRIPTIONS;

  protected readonly descriptionMap = computed(() => {
    const map = new Map<EcosystemCategory, string>();
    for (const desc of this.descriptions) {
      map.set(desc.category, desc.description);
    }
    return map;
  });

  protected getCategoryDescription(category: EcosystemCategory): string {
    return this.descriptionMap().get(category) ?? '';
  }

  protected select(category: EcosystemCategory | null): void {
    this.categoryChange.emit(category);
  }
}
