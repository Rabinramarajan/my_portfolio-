import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DataService, trackById } from '../../core';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

/** Awards & Achievements page — grid of recognitions and accolades. */
@Component({
  selector: 'app-awards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, PageLayout, GlassCard, Stagger],
  templateUrl: './awards.html',
  styleUrl: './awards.scss',
  host: { class: 'block' },
})
export class AwardsPage {
  private readonly data = inject(DataService);

  protected readonly awards = this.data.load('awards');

  protected readonly trackById = trackById;

  protected formatDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso ?? '';
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}
