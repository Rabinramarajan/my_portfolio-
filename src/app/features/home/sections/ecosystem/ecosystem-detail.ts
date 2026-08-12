import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import type { EcosystemNode, PortfolioProject } from '../../../../core/models/portfolio.models';
import { PortfolioStore } from '../../../../core/services/portfolio-store';

/**
 * Inline technology detail panel that appears within the constellation when a
 * node is selected. Not a modal — it's part of the composition.
 */
@Component({
  selector: 'app-ecosystem-detail',
  templateUrl: './ecosystem-detail.html',
  styleUrl: './ecosystem-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcosystemDetail {
  readonly nodes = input.required<readonly EcosystemNode[]>();
  readonly selectedId = input.required<string>();

  private readonly store = inject(PortfolioStore);

  protected readonly detail = computed(() => {
    return this.nodes().find((n) => n.id === this.selectedId()) ?? null;
  });

  /** Resolve project slugs to full project objects. */
  protected readonly projectNames = computed<readonly PortfolioProject[]>(() => {
    const tech = this.detail();
    if (!tech?.projects?.length) return [];
    const allProjects = this.store.projects();
    return tech.projects
      .map((slug) => allProjects.find((p) => p.slug === slug))
      .filter((p): p is PortfolioProject => p !== undefined);
  });
}
