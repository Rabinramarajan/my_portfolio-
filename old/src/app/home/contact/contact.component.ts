import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AnalyticsServiceService } from 'src/app/common/service/analytics/analytics-service.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit {
  jsonDataResult: any = [];

  constructor(
    public analyticsService: AnalyticsServiceService,
    private http: HttpClient
  ) {
    this.http.get('assets/i18n/data.json').subscribe((res: any) => {
      this.jsonDataResult = res;
      console.log(this.jsonDataResult);

    });
  }

  ngOnInit(): void {}
}
