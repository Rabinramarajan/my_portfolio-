import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { EcosystemNode } from '../../../../core/models/portfolio.models';

/** A resolved connection line between two technology nodes. */
export interface ConnectionLine {
  readonly id: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly isActive: boolean;
}

/**
 * SVG overlay that draws architectural connection lines between related
 * technology nodes. Purely decorative — `aria-hidden` at the template level.
 *
 * Lines are 1px, low-opacity gray by default and transition to the lime accent
 * when either endpoint is hovered or selected.
 */
@Component({
  selector: 'app-ecosystem-connections',
  templateUrl: './ecosystem-connections.html',
  styleUrl: './ecosystem-connections.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcosystemConnections {
  readonly nodes = input.required<readonly EcosystemNode[]>();
  readonly hoveredId = input<string | null>(null);
  readonly selectedId = input<string | null>(null);

  /** Resolved connection lines with SVG coordinates. */
  readonly lines = computed<readonly ConnectionLine[]>(() => {
    const allNodes = this.nodes();
    const hovered = this.hoveredId();
    const selected = this.selectedId();
    const activeId = hovered ?? selected;

    const seen = new Set<string>();
    const result: ConnectionLine[] = [];

    for (const node of allNodes) {
      for (const targetId of node.connections) {
        const pairKey = [node.id, targetId].sort().join('--');
        if (seen.has(pairKey)) continue;
        seen.add(pairKey);

        const target = allNodes.find((n) => n.id === targetId);
        if (!target) continue;

        const isActive =
          activeId != null && (node.id === activeId || target.id === activeId);

        result.push({
          id: pairKey,
          ...this.polarToSvg(node.angle, node.radius),
          ...this.polarToSvg2(target.angle, target.radius),
          isActive,
        });
      }
    }

    return result;
  });

  private polarToSvg(
    angle: number,
    radius: number,
  ): { x1: number; y1: number } {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x1: 50 + radius * 50 * Math.cos(rad),
      y1: 50 + radius * 50 * Math.sin(rad),
    };
  }

  private polarToSvg2(
    angle: number,
    radius: number,
  ): { x2: number; y2: number } {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x2: 50 + radius * 50 * Math.cos(rad),
      y2: 50 + radius * 50 * Math.sin(rad),
    };
  }
}
