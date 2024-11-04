import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {

  private readonly SETTINGS_URL = './app.settings.json';
  private readonly USER_DATA_URL = './app.userData.json';
  public environment: any = {};
  public userData: any = {};


  constructor(private http: HttpClient) { }

  private loadJsonFile<T>(url: string): Observable<T> {
    const timestamp = new Date().getTime();
    return this.http.get<T>(`${url}?v=${timestamp}`).pipe(
      catchError(error => {
        console.error(`Failed to load config from ${url}`, error);
        return of({} as T);  // Return an empty object on error
      })
    );
  }


  loadConfig(): Observable<any> {
    return this.loadJsonFile<any>(this.SETTINGS_URL);
  }

  loadUserData(): Observable<any> {
    return this.loadJsonFile<any>(this.USER_DATA_URL);
  }

}
