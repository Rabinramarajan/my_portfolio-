import { Component, OnInit } from '@angular/core';
import { AnalyticsServiceService } from 'src/app/common/service/analytics/analytics-service.service';
import * as AOS from 'aos';


@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit{

  constructor(
    public analyticsService: AnalyticsServiceService
  ) { }

  ngOnInit(): void {
    AOS.init();
  }
}
