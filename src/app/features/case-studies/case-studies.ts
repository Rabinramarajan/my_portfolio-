import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService, trackById } from '../../core';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

/** Case Studies index — grid of deep-dive project cards. */
@Component({
  selector: 'app-case-studies',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, RouterLink, PageLayout, GlassCard, Stagger],
  templateUrl: './case-studies.html',
  styleUrl: './case-studies.scss',
  host: { class: 'block' },
})
export class CaseStudiesPage {
  private readonly data = inject(DataService);

  protected readonly caseStudies = this.data.load('case-studies');

  protected readonly trackById = trackById;
}
