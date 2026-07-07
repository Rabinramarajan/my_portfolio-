import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules, withViewTransitions } from '@angular/router';
import { provideHttpClient, withXsrfConfiguration } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    // HTTP client with XSRF protection (minimal overhead)
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: 'X-CSRF-TOKEN',
        headerName: 'X-CSRF-TOKEN',
      })
    ),
    // Router with aggressive preloading + native View Transitions API (250ms crossfade + rise)
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withViewTransitions()
    ),
    provideClientHydration(withEventReplay()),
  ],
};
