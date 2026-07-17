import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DataService, trackById } from '../../core';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

/** Open Source Contributions page — notable contributions to open source projects. */
@Component({
  selector: 'app-opensource',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, PageLayout, GlassCard, Stagger],
  templateUrl: './opensource.html',
  styleUrl: './opensource.scss',
  host: { class: 'block' },
})
export class OpenSourcePage {
  private readonly data = inject(DataService);

  protected readonly contributions = this.data.load('opensource');

  protected readonly trackById = trackById;

  protected formatDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso ?? '';
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}
