import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { CursorTarget } from '../../../../shared/directives/cursor-target';
import { MediaImage } from '../../../../shared/components/media-image/media-image';
import { Parallax } from '../../../../shared/directives/parallax';
import { PortfolioStore } from '../../../../core/services/portfolio-store';
import { Reveal } from '../../../../shared/directives/reveal';
import { SectionHeader } from '../../../../shared/components/section-header/section-header';
import type { PortfolioSkill, SkillGroup } from '../../../../core/models/portfolio.models';

/**
 * Technology ecosystem as floating chips.
 *
 * Deliberately no proficiency bars or percentages — they invent precision that
 * does not exist. Grouping and emphasis carry the same information honestly.
 * Chips stagger in on entrance, drift at slightly different speeds while
 * scrolling, and lift a little on hover.
 */
@Component({
  selector: 'app-skills',
  imports: [SectionHeader, MediaImage, Reveal, CursorTarget, Parallax],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skills {
  private readonly store = inject(PortfolioStore);
  protected readonly media = this.store.media;
  protected readonly sections = this.store.sections;

  protected readonly clusters = this.store.skills;
  protected readonly active = signal<SkillGroup | null>(null);

  protected readonly visible = computed(() => {
    const group = this.active();
    return group ? this.clusters().filter((cluster) => cluster.group === group) : this.clusters();
  });

  protected itemName(item: string | PortfolioSkill): string {
    return typeof item === 'string' ? item : item.name;
  }

  /** Single-letter monogram for the chip's tile — no icon assets needed. */
  protected monogram(item: string | PortfolioSkill): string {
    return this.itemName(item).trim().charAt(0).toUpperCase();
  }

  /** Per-chip scroll drift so neighbouring chips float at different speeds. */
  protected drift(index: number): number {
    return ((index % 3) - 1) * 16;
  }

  /** Tiny static tilt variance so the chips read as hand-placed, not a grid. */
  protected tilt(index: number): string {
    return `${(index % 3) - 1}deg`;
  }

  protected select(group: SkillGroup): void {
    this.active.update((current) => (current === group ? null : group));
  }
}
