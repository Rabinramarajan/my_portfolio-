import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AnalyticsServiceService } from 'src/app/common/service/analytics/analytics-service.service';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit{
  active = 0
  jsonDataResult: any = [];

  constructor(
    public analyticsService: AnalyticsServiceService,
    private http: HttpClient
  ) {
    this.http.get('assets/i18n/data.json').subscribe((res: any) => {
      this.jsonDataResult = res;
    });
  }

  ngOnInit(): void {

  }

}
