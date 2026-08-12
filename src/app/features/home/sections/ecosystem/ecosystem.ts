import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { CursorTarget } from '../../../../shared/directives/cursor-target';
import { PortfolioStore } from '../../../../core/services/portfolio-store';
import { DeviceCapability } from '../../../../core/services/device-capability';
import { ECOSYSTEM_CATEGORIES, ECOSYSTEM_NODES } from '../../../../core/config/portfolio.content';
import type { EcosystemCategory, EcosystemNode } from '../../../../core/models/portfolio.models';

import { EcosystemCategorySelector } from './ecosystem-category-selector';
import { EcosystemConnections } from './ecosystem-connections';
import { EcosystemNodeComponent } from './ecosystem-node';
import { EcosystemDetail } from './ecosystem-detail';
import { EcosystemMobile } from './ecosystem-mobile';

/**
 * Engineering Constellation — Rabin's technology ecosystem rendered as a
 * connected visual architecture map.
 *
 * Desktop: interactive constellation with center identity, positioned nodes,
 *   and SVG connection lines.
 * Mobile: vertical tree layout grouped by category.
 *
 * No proficiency bars, no percentages. Grouping, hierarchy and connections
 * carry the information.
 */
@Component({
  selector: 'app-ecosystem',
  imports: [
    CursorTarget,
    EcosystemCategorySelector,
    EcosystemConnections,
    EcosystemNodeComponent,
    EcosystemDetail,
    EcosystemMobile,
  ],
  templateUrl: './ecosystem.html',
  styleUrl: './ecosystem.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ecosystem {
  private readonly store = inject(PortfolioStore);
  private readonly device = inject(DeviceCapability);

  protected readonly sections = this.store.sections;
  protected readonly categories = ECOSYSTEM_CATEGORIES;
  protected readonly allNodes: readonly EcosystemNode[] = ECOSYSTEM_NODES;

  protected readonly activeCategory = signal<EcosystemCategory | null>(null);
  protected readonly hoveredId = signal<string | null>(null);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly searchQuery = signal<string>('');

  protected readonly isMobile = this.device.isMobile;

  /** Nodes visible after category filter and search query are applied. */
  protected readonly visibleNodes = computed(() => {
    const cat = this.activeCategory();
    const query = this.searchQuery().toLowerCase();
    let filtered = cat ? this.allNodes.filter((n) => n.category === cat) : this.allNodes;
    if (query) {
      filtered = filtered.filter(
        (n) =>
          n.name.toLowerCase().includes(query) ||
          n.meta?.toLowerCase().includes(query) ||
          n.features?.some((f) => f.toLowerCase().includes(query)),
      );
    }
    return filtered;
  });

  /** Which nodes should glow as "related" to the currently hovered/selected node. */
  protected readonly relatedIds = computed<ReadonlySet<string>>(() => {
    const activeId = this.hoveredId() ?? this.selectedId();
    if (!activeId) return new Set();
    const node = this.allNodes.find((n) => n.id === activeId);
    return new Set(node?.connections ?? []);
  });

  protected isRelated(nodeId: string): boolean {
    return this.relatedIds().has(nodeId);
  }

  protected isMuted(nodeId: string): boolean {
    const activeId = this.hoveredId() ?? this.selectedId();
    if (!activeId) return false;
    return nodeId !== activeId && !this.relatedIds().has(nodeId);
  }

  protected isActive(nodeId: string): boolean {
    const activeId = this.hoveredId() ?? this.selectedId();
    return nodeId === activeId;
  }

  protected onCategoryChange(cat: EcosystemCategory | null): void {
    this.activeCategory.set(cat);
    this.selectedId.set(null);
    this.hoveredId.set(null);
  }

  protected onNodeHovered(id: string | null): void {
    this.hoveredId.set(id);
  }

  protected onNodeSelected(id: string): void {
    this.selectedId.update((current) => (current === id ? null : id));
  }
}
