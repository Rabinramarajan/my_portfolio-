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
  testUrl: string = 'https://rabinr.com';
  pageSpeedData: any;

  constructor(public appSetting: AppSettingsService,
    private speedInsightsService: SpeedInsightsService) {
  }

  ngOnInit(): void {
  
  }

  getPageSpeedData() {
    this.speedInsightsService.fetchPageSpeedInsights(this.testUrl).subscribe(
      (data) => {
        this.pageSpeedData = data;
      },
      (error) => {
        console.error('Error fetching PageSpeed data:', error);
      }
    );
  }
}
