import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { PortfolioDataService } from '../../../../shared/services/portfolio-data.service';
import {
  AuroraBackgroundDirective,
  MouseFollowGlowDirective,
  ScrollTriggerDirective,
  MagneticButtonDirective,
  FloatingTextDirective,
} from '../../../../shared/directives';

@Component({
  selector: 'app-hero-section',
  imports: [
    AuroraBackgroundDirective,
    MouseFollowGlowDirective,
    ScrollTriggerDirective,
    MagneticButtonDirective,
    FloatingTextDirective,
  ],
  templateUrl: './hero-section.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {
  protected readonly pds = inject(PortfolioDataService);
}
