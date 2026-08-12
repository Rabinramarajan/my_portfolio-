import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Reveal } from '../../../../shared/directives/reveal';
import type { EcosystemCategory, EcosystemNode } from '../../../../core/models/portfolio.models';

interface MobileBranch {
  readonly root: EcosystemNode;
  readonly children: readonly EcosystemNode[];
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

  /** Groups nodes into visual branches: primary nodes become roots, others are children. */
  protected readonly branches = computed<readonly MobileBranch[]>(() => {
    const all = this.nodes();
    const cat = this.activeCategory();
    const filtered = cat ? all.filter((n) => n.category === cat) : all;

    // Group by category
    const categoryMap = new Map<string, EcosystemNode[]>();
    for (const node of filtered) {
      const list = categoryMap.get(node.category) ?? [];
      list.push(node);
      categoryMap.set(node.category, list);
    }

    const result: MobileBranch[] = [];
    for (const [, nodes] of categoryMap) {
      const primary = nodes.filter((n) => n.tier === 'primary');
      const others = nodes.filter((n) => n.tier !== 'primary');

      if (primary.length > 0) {
        // First primary becomes root, rest become children along with secondaries
        result.push({
          root: primary[0],
          children: [...primary.slice(1), ...others],
        });
      } else if (others.length > 0) {
        result.push({
          root: others[0],
          children: others.slice(1),
        });
      }
    }

    return result;
  });
}
