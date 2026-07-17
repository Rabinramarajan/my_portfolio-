import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';
import type { SkillBranch, SkillsTreeConfig } from '../../core/models';

@Component({
  selector: 'app-skills-tree',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, PageLayout, GlassCard, Stagger, Icon],
  templateUrl: './skills-tree.html',
  styleUrl: './skills-tree.scss',
  host: { class: 'block' },
})
export class SkillsTreePage {
  private readonly dataService = inject(DataService);
  readonly skillsTree = computed(() => {
    const resource = this.dataService.load('skills-tree');
    return resource as unknown as SkillsTreeConfig;
  });
  protected selectedBranch = signal<SkillBranch | null>(null);

  protected selectBranch(branch: SkillBranch): void {
    this.selectedBranch.set(this.selectedBranch() === branch ? null : branch);
  }

  protected getProficiencyColor(proficiency: string): string {
    const colorMap: Record<string, string> = {
      beginner: 'amber',
      intermediate: 'blue',
      advanced: 'green',
      expert: 'purple',
    };
    return colorMap[proficiency] || 'gray';
  }

  protected getLevelProgress(xp: number): number {
    const maxXpPerLevel = 500;
    return Math.min(((xp % maxXpPerLevel) / maxXpPerLevel) * 100, 100);
  }
}
