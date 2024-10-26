import { Injectable } from '@angular/core';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsServiceService {

  constructor(
    private $gaService: GoogleAnalyticsService
  ) { }

  sendAnalyticEvent(action: string, category: string, label: any){
    debugger
    this.$gaService.event(action, category, label)
  }


}
