import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { EcosystemNode } from '../../../../core/models/portfolio.models';

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

  protected readonly detail = computed(() => {
    return this.nodes().find((n) => n.id === this.selectedId()) ?? null;
  });
}
