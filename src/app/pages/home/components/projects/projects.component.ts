import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PortfolioDataService } from '../../../../shared/services/portfolio-data.service';
import { UiBadgeComponent } from '../../../../shared/ui';
import { MagneticButtonDirective, ScrollTriggerDirective } from '../../../../shared/directives';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ScrollTriggerDirective,
    MagneticButtonDirective,
    UiBadgeComponent,
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  protected readonly pds = inject(PortfolioDataService);
}
