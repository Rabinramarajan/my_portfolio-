import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { PortfolioDataService } from '../../../../shared/services/portfolio-data.service';
import { ScrollTriggerDirective } from '../../../../shared/directives';

@Component({
  selector: 'app-testimonials-section',
  imports: [ScrollTriggerDirective],
  templateUrl: './testimonials-section.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsSection {
  protected readonly pds = inject(PortfolioDataService);
}
