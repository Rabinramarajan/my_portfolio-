import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DataService, trackById } from '../../core';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

/** Certifications page — grid of verified professional credentials. */
@Component({
  selector: 'app-certifications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, PageLayout, GlassCard, Stagger],
  templateUrl: './certifications.html',
  styleUrl: './certifications.scss',
  host: { class: 'block' },
})
export class CertificationsPage {
  private readonly data = inject(DataService);

  protected readonly certificates = this.data.load('certificates');

  protected readonly trackById = trackById;

  /** Format an ISO date as e.g. "May 2026"; returns the raw input if unparseable. */
  protected formatDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso ?? '';
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}
