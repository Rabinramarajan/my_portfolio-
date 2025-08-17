import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppSettingsService {
  screenName = '';
  public environment: any = {};

  languageObject: any = {};
  language: any = [];

  constructor() { }

  loadConfig() {
    let d = new Date();
    let n = d.getTime();
    // Determine file based on environment name
    const envName = environment?.name ?? 'development';
    const candidateFiles = [
      envName === 'production' ? './app.settings.prod.json' :
      envName === 'qa' ? './app.settings.qa.json' :
      envName === 'work' ? './app.settings.work.json' :
      './app.settings.json',
      // Fallback to default if the first fails
      './app.settings.json'
    ];

    const tryFetch = (paths: string[]): Promise<any> => {
      if (!paths.length) return Promise.reject('No config files found');
      const [first, ...rest] = paths;
      return fetch(`${first}?v=${n}`).then((response) => {
        if (!response.ok) {
          // try next candidate on 404/500
          return tryFetch(rest);
        }
        return response.json();
      }).catch(() => tryFetch(rest));
    };

    return from(tryFetch(candidateFiles));
  }
}
