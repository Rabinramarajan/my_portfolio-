import { APP_INITIALIZER, ApplicationConfig, ApplicationRef, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { firstValueFrom } from 'rxjs';
import { AppSettingsService } from './common/services/app-settings/app-settings.service';
import { HttpClientModule } from '@angular/common/http';
import { RouteReuseService } from './common/services/route-reuse/route-reuse.service';
import { inject } from '@vercel/analytics';
import { environment } from '../environment/environment.prod';


if (environment.production && environment.enableAnalytics) {
  inject();
}

export const appInitializerFactory = (configService: AppSettingsService) => {
  return async () => {
    try {
      const [environmentConfig, userConfig] = await Promise.all([
        firstValueFrom(configService.loadConfig()),
        firstValueFrom(configService.loadUserData())
      ]);

      console.log(
        environmentConfig, userConfig
      );

      configService.environment = environmentConfig;
      configService.userData = userConfig;
    } catch (error) {
      console.error('Error loading application configuration:', error);
      throw error;  // Re-throw to prevent app startup on failure
    }
  };
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    importProvidersFrom(
      HttpClientModule,
    ),
    { provide: RouteReuseStrategy, useClass: RouteReuseService },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [AppSettingsService],
      multi: true,
    }
  ]
};
