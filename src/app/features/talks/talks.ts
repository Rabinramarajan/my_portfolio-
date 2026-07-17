import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DataService, trackById } from '../../core';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

/** Tech Talks page — conference talks and presentations. */
@Component({
  selector: 'app-talks',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, PageLayout, GlassCard, Stagger],
  templateUrl: './talks.html',
  styleUrl: './talks.scss',
  host: { class: 'block' },
})
export class TalksPage {
  private readonly data = inject(DataService);

  protected readonly talks = this.data.load('talks');

  protected readonly trackById = trackById;

  protected formatDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso ?? '';
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}
