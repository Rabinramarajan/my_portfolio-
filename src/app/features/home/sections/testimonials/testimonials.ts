import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PortfolioStore } from '../../../../core/services/portfolio-store';
import { Reveal } from '../../../../shared/directives/reveal';
import { SectionHeader } from '../../../../shared/components/section-header/section-header';

/**
 * Renders nothing until real testimonials exist.
 *
 * The component is wired end to end so adding quotes to the content file is the
 * only step required — but an absent section is far better than an invented
 * endorsement, so the empty case is a hard "render nothing".
 */
@Component({
  selector: 'app-testimonials',
  imports: [SectionHeader, Reveal],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Testimonials {
  private readonly store = inject(PortfolioStore);

  protected readonly sections = this.store.sections;
  protected readonly testimonials = this.store.testimonials;
  protected readonly hasTestimonials = this.store.hasTestimonials;
}
