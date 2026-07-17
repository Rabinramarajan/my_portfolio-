import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';
import type { LearningTimelineConfig } from '../../core/models';

@Component({
  selector: 'app-learning-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, PageLayout, GlassCard, Stagger, Icon],
  templateUrl: './learning-timeline.html',
  styleUrl: './learning-timeline.scss',
  host: { class: 'block' },
})
export class LearningTimelinePage {
  private readonly dataService = inject(DataService);
  readonly timeline = signal<LearningTimelineConfig | null>(null);

  constructor() {
    effect(() => {
      const resource = this.dataService.load('learning-timeline');
      if (resource) {
        this.timeline.set(resource as unknown as LearningTimelineConfig);
      }
    });
  }

  protected getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
      certification: 'Award',
      course: 'BookOpen',
      workshop: 'Zap',
      conference: 'Users',
      'self-study': 'GraduationCap',
    };
    return iconMap[category] || 'Circle';
  }

  protected getImpactColor(impact: string): string {
    const colorMap: Record<string, string> = {
      high: 'green',
      medium: 'blue',
      low: 'amber',
    };
    return colorMap[impact] || 'gray';
  }
}
