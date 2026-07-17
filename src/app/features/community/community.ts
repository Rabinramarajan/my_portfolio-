import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DataService, trackById } from '../../core';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

/** Community Contributions page — mentoring, volunteering, and community building. */
@Component({
  selector: 'app-community',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, PageLayout, GlassCard, Stagger],
  templateUrl: './community.html',
  styleUrl: './community.scss',
  host: { class: 'block' },
})
export class CommunityPage {
  private readonly data = inject(DataService);

  protected readonly contributions = this.data.load('community');

  protected readonly trackById = trackById;

  protected formatDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso ?? '';
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}
