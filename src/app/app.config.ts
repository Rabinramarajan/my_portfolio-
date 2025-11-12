import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';
import { environment } from '../environments/environment';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule } from '@ngx-translate/core';
import { importProvidersFrom } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { routes } from './app.routes';
import { HttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // Enable Angular's animation support for components that use animation triggers
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),

    // Modern HTTP setup
    provideHttpClient(withInterceptorsFromDi()),

    // Ngx-translate: register the TranslateModule and HTTP loader providers
    importProvidersFrom(TranslateModule.forRoot()),
    ...provideTranslateHttpLoader({ prefix: './i18n/', suffix: '.json' }),

    // NgBootstrap (ng-bootstrap) providers
    importProvidersFrom(NgbModule),

    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    // Google Analytics (ngx-google-analytics) provider. Set your measurement id in
    // src/environments/environment.ts as `gaMeasurementId` (e.g. 'G-XXXXXXXXX').
    // If empty, the library will be initialized with an empty id — replace the
    // placeholder in your environment files for production.
    importProvidersFrom(NgxGoogleAnalyticsModule.forRoot(environment.gaMeasurementId)),
  ],
};
