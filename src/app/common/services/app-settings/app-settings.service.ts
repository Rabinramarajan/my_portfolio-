import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {

  public environment: any = {};

  constructor(private http: HttpClient) { }

  loadConfig() {
    let d = new Date();
    let n = d.getTime();
    return this.http.get('./app.settings.json?v=' + n);
  }
}
