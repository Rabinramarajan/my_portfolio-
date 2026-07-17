import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DataService, trackById } from '../../core';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

/** Analytics Dashboard page — portfolio metrics and statistics. */
@Component({
  selector: 'app-analytics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, PageLayout, GlassCard, Stagger, DatePipe],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
  host: { class: 'block' },
})
export class AnalyticsPage {
  private readonly data = inject(DataService);

  protected readonly analytics = this.data.load('analytics');

  protected readonly trackById = trackById;

  protected topTechs = computed(() => {
    const techs = this.analytics.value()?.technologies ?? [];
    return techs.slice(0, 5);
  });

  protected topCountries = computed(() => {
    const geo = this.analytics.value()?.geography ?? [];
    return geo.slice(0, 5);
  });

  protected formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  }

  protected calculateCompletionRate(completed: number, total: number): number {
    return Math.round((completed / total) * 100);
  }

  protected getCommitTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
    if (current > previous * 1.1) return 'up';
    if (current < previous * 0.9) return 'down';
    return 'stable';
  }
}
