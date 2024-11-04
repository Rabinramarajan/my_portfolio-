import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSettingsService } from './common/services/app-settings/app-settings.service';
import { Maintenance } from './common/templates/maintenance';
import { SpeedInsightsService } from './common/services/speed-insights/speed-insights.service';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Maintenance, JsonPipe, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'myPortfolio';
  insightsData: any;
  errorMessage: string | null = null;

  private testUrl = 'https://rabinr.com/'; 

  constructor(public appSetting: AppSettingsService,
    private speedInsightsService: SpeedInsightsService) {
  }

  ngOnInit(): void {
    this.getInsights();
  }

  getInsights() {
    this.speedInsightsService.fetchPageSpeedInsights(this.testUrl).subscribe({
      next: (data) => {
        this.insightsData = data;
      },
      error: (err) => {
        this.errorMessage = 'Error fetching PageSpeed data: ' + err.message;
      },
    });
  }
}
