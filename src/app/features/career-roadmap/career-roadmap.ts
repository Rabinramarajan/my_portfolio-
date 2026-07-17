import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';
import type { CareerRoadmapConfig } from '../../core/models';

@Component({
  selector: 'app-career-roadmap',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, PageLayout, GlassCard, Stagger, Icon],
  templateUrl: './career-roadmap.html',
  styleUrl: './career-roadmap.scss',
  host: { class: 'block' },
})
export class CareerRoadmapPage {
  private readonly dataService = inject(DataService);
  readonly roadmap = this.dataService.load('career-roadmap') as unknown as CareerRoadmapConfig;

  protected getTypeIcon(type: string): string {
    const iconMap: Record<string, string> = {
      promotion: 'TrendingUp',
      achievement: 'Award',
      learning: 'BookOpen',
      transition: 'Zap',
    };
    return iconMap[type] || 'Circle';
  }

  protected getTypeColor(type: string): string {
    const colorMap: Record<string, string> = {
      promotion: 'blue',
      achievement: 'green',
      learning: 'amber',
      transition: 'purple',
    };
    return colorMap[type] || 'gray';
  }
}
