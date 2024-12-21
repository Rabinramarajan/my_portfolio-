import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { appInitializerFactory } from './app.config.initializer';
import { RouteReuseService } from './common/services/route-reuse/route-reuse.service';
import { AppSettingsService } from './common/services/app-settings/app-settings.service';
import { inject } from '@vercel/analytics';
import { environmentProd } from '../environment/environment.prod';
import { environment } from '../environment/environment';

if (environmentProd.production && environmentProd.enableAnalytics) {
  inject();
}

if (!environment.production) {
  import('@vercel/toolbar').then(() => {
    // Toolbar might initialize automatically now
    console.log('Vercel toolbar should now be initialized automatically.');
  }).catch((err) => {
    console.error('Error loading Vercel Toolbar:', err);
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    { provide: RouteReuseStrategy, useClass: RouteReuseService },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [AppSettingsService],
      multi: true,
    },
  ]
};
