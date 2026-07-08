import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { PortfolioDataService } from '../../../../shared/services/portfolio-data.service';
import {
  AuroraBackgroundDirective,
  MouseFollowGlowDirective,
  ScrollTriggerDirective,
  MagneticButtonDirective,
  StaggerDirective,
} from '../../../../shared/directives';
import { ArrowIconComponent } from '../../../../shared/components';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    AuroraBackgroundDirective,
    MouseFollowGlowDirective,
    ScrollTriggerDirective,
    MagneticButtonDirective,
    StaggerDirective,
    ArrowIconComponent,
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  protected readonly pds = inject(PortfolioDataService);
}
