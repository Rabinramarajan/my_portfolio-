import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { PortfolioDataService } from '../../../../../shared/services/portfolio-data.service';
import { HomeStateService } from '../../../services/home-state.service';

@Component({
  selector: 'app-resume',
  standalone: true,
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumeComponent implements OnInit {
  protected readonly pds = inject(PortfolioDataService);
  private readonly homeState = inject(HomeStateService);

  ngOnInit(): void {
    this.homeState.markResumeLoaded();
  }
}
