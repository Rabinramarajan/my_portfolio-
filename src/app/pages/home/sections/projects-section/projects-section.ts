import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { NgOptimizedImage, SlicePipe } from '@angular/common';
import { PortfolioDataService } from '../../../../shared/services/portfolio-data.service';
import { ScrollTriggerDirective, MagneticButtonDirective } from '../../../../shared/directives';

@Component({
  selector: 'app-projects-section',
  imports: [ScrollTriggerDirective, MagneticButtonDirective, NgOptimizedImage, SlicePipe],
  templateUrl: './projects-section.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsSection {
  protected readonly pds = inject(PortfolioDataService);
}
