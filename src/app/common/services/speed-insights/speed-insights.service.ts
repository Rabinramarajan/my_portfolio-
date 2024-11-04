import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpeedInsightsService {
  private readonly apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
  private readonly apiKey = 'AIzaSyDPO7BIPTdNxl-qAie5d7THCafcs74lGgc'; // Replace with your actual API key

  constructor(private http: HttpClient) {}

  fetchPageSpeedInsights(url: string): Observable<any> {
    const params = new HttpParams()
      .set('url', url)
      .set('key', this.apiKey);
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      timeout(20000) // Increase timeout to 20 seconds
    );
  }
}
