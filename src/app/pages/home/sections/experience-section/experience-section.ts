import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { PortfolioDataService } from '../../../../shared/services/portfolio-data.service';
import { ScrollTriggerDirective } from '../../../../shared/directives';

@Component({
  selector: 'app-experience-section',
  imports: [ScrollTriggerDirective],
  templateUrl: './experience-section.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceSection {
  protected readonly pds = inject(PortfolioDataService);
}
