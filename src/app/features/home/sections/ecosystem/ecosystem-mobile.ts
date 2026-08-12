import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Reveal } from '../../../../shared/directives/reveal';
import { CATEGORY_DESCRIPTIONS } from '../../../../core/config/portfolio.content';
import type { CategoryDescription, EcosystemCategory, EcosystemNode } from '../../../../core/models/portfolio.models';

interface MobileBranch {
  readonly root: EcosystemNode;
  readonly children: readonly EcosystemNode[];
}

interface MobileCategory {
  readonly category: EcosystemCategory;
  readonly description: string;
  readonly branches: readonly MobileBranch[];
}

/**
 * Vertical tree layout for the ecosystem section on mobile.
 *
 * Instead of squeezing the constellation into a small viewport, this renders
 * a clean vertical hierarchy grouped by category — much more readable on
 * narrow screens.
 */
@Component({
  selector: 'app-ecosystem-mobile',
  imports: [Reveal],
  templateUrl: './ecosystem-mobile.html',
  styleUrl: './ecosystem-mobile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcosystemMobile {
  readonly nodes = input.required<readonly EcosystemNode[]>();
  readonly activeCategory = input<EcosystemCategory | null>(null);

  /** Groups nodes by category with descriptions and visual branches. */
  protected readonly categories = computed<readonly MobileCategory[]>(() => {
    const all = this.nodes();
    const filterCat = this.activeCategory();
    const filtered = filterCat ? all.filter((n) => n.category === filterCat) : all;

    // Group by category
    const categoryMap = new Map<EcosystemCategory, EcosystemNode[]>();
    for (const node of filtered) {
      const list = categoryMap.get(node.category) ?? [];
      list.push(node);
      categoryMap.set(node.category, list);
    }

    const result: MobileCategory[] = [];
    for (const category of CATEGORY_DESCRIPTIONS) {
      const nodes = categoryMap.get(category.category);
      if (!nodes) continue;

      const primary = nodes.filter((n) => n.tier === 'primary');
      const others = nodes.filter((n) => n.tier !== 'primary');

      const branches: MobileBranch[] = [];
      if (primary.length > 0) {
        branches.push({
          root: primary[0],
          children: [...primary.slice(1), ...others],
        });
      } else if (others.length > 0) {
        branches.push({
          root: others[0],
          children: others.slice(1),
        });
      }

      if (branches.length > 0) {
        result.push({
          category: category.category,
          description: category.description,
          branches,
        });
      }
    }

    return result;
  });
}
