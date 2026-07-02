import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { PortfolioDataService } from '../../../../shared/services/portfolio-data.service';

@Component({
  selector: 'app-resume-section',
  imports: [],
  templateUrl: './resume-section.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumeSection {
  protected readonly pds = inject(PortfolioDataService);
}
