import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { CursorTarget } from '../../../../shared/directives/cursor-target';
import { MediaImage } from '../../../../shared/components/media-image/media-image';
import { PortfolioStore } from '../../../../core/services/portfolio-store';
import { Reveal } from '../../../../shared/directives/reveal';
import { SectionHeader } from '../../../../shared/components/section-header/section-header';
import type { PortfolioSkill, SkillGroup } from '../../../../core/models/portfolio.models';

/**
 * Technology ecosystem as a filterable cluster.
 *
 * Deliberately no proficiency bars or percentages — they invent precision that
 * does not exist. Grouping and emphasis carry the same information honestly.
 */
@Component({
  selector: 'app-skills',
  imports: [SectionHeader, MediaImage, Reveal, CursorTarget],
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

  protected select(group: SkillGroup): void {
    this.active.update((current) => (current === group ? null : group));
  }
}
