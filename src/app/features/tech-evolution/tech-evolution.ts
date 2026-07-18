import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import type { TechEvolutionConfig } from '../../core/models';

@Component({
  selector: 'app-tech-evolution',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, PageLayout, GlassCard, Stagger],
  templateUrl: './tech-evolution.html',
  styleUrl: './tech-evolution.scss',
  host: { class: 'block' },
})
export class TechEvolutionPage {
  private readonly dataService = inject(DataService);
  readonly evolution = this.dataService.load('tech-evolution') as unknown as TechEvolutionConfig;

  protected getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      frontend: 'blue',
      backend: 'green',
      mobile: 'purple',
      devops: 'amber',
      tools: 'cyan',
      architecture: 'red',
    };
    return colorMap[category] || 'gray';
  }

  protected getProficiencyLevel(proficiency: string): number {
    const levels: Record<string, number> = {
      beginner: 25,
      intermediate: 50,
      advanced: 75,
      expert: 100,
    };
    return levels[proficiency] || 0;
  }
}
