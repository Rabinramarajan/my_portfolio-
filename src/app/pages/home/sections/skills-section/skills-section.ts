import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { PortfolioDataService } from '../../../../shared/services/portfolio-data.service';
import { ScrollTriggerDirective } from '../../../../shared/directives';

@Component({
  selector: 'app-skills-section',
  imports: [ScrollTriggerDirective],
  templateUrl: './skills-section.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsSection {
  protected readonly pds = inject(PortfolioDataService);
}
