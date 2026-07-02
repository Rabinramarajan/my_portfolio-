import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { PortfolioDataService } from '../../../../shared/services/portfolio-data.service';
import { ScrollTriggerDirective, GridBackgroundDirective } from '../../../../shared/directives';

@Component({
  selector: 'app-about-section',
  imports: [ScrollTriggerDirective, GridBackgroundDirective, NgOptimizedImage],
  templateUrl: './about-section.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutSection {
  protected readonly pds = inject(PortfolioDataService);
}
