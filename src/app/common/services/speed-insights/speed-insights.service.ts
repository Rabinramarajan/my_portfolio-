import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';

interface PageSpeedResponse {
  // Define the structure of the PageSpeed API response based on your needs
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class SpeedInsightsService {
  private readonly apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

  constructor(private http: HttpClient) {}

  fetchPageSpeedInsights(url: string): Observable<PageSpeedResponse> {
    const params = new HttpParams()
      .set('url', url) // The URL of the page you want to analyze
      .set('key', environment.pageSpeedApiKey); // Your API key from the environment

    return this.http.get<PageSpeedResponse>(this.apiUrl, { params });
  }
}
