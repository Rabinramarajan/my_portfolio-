import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import type { ExperienceTimelineConfig } from '../../core/models';

@Component({
  selector: 'app-experience-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, PageLayout, GlassCard, Stagger],
  templateUrl: './experience-timeline.html',
  styleUrl: './experience-timeline.scss',
  host: { class: 'block' },
})
export class ExperienceTimelinePage {
  private readonly dataService = inject(DataService);
  readonly timeline = signal<ExperienceTimelineConfig | null>(null);

  constructor() {
    effect(() => {
      const resource = this.dataService.load('experience-timeline');
      if (resource) {
        this.timeline.set(resource as unknown as ExperienceTimelineConfig);
      }
    });
  }

  protected isCurrentRole(endDate: string | undefined): boolean {
    return !endDate;
  }
}
