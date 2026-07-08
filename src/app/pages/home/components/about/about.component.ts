import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { PortfolioDataService } from '../../../../shared/services/portfolio-data.service';
import { GridBackgroundDirective, ScrollTriggerDirective, StaggerDirective } from '../../../../shared/directives';
import { ResumeButtonComponent } from '../../../../shared/components';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [GridBackgroundDirective, ScrollTriggerDirective, StaggerDirective, ResumeButtonComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  protected readonly pds = inject(PortfolioDataService);
}
