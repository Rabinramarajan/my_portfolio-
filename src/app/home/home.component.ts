import { Component, OnInit } from '@angular/core';
import { AnalyticsServiceService } from '../common/service/analytics/analytics-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{

  constructor(
    private analyticsService: AnalyticsServiceService,
  ) {
  }

  ngOnInit(): void {
    // this.analyticsService.sendAnalyticPageView("/inicio", "Se entro a inicio")
  }

}
