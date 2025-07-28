import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
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
    return from(
      fetch('./app.settings.json?v=' + n).then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
    );
  }
}
