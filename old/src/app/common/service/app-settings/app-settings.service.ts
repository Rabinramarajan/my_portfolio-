import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {

   constructor(private http: HttpClient) { }

  public environment: any = {
    userManualLocation: "",
  };
  loadConfig() {
    // console.log('call');
    let d = new Date();
    let n = d.getTime();
    return this.http
      .get('./app.settings.json?v=' + n)
      .toPromise()
      .then((success: any) => {
        this.environment = success;
        console.log(this.environment);
      });
  }
}
