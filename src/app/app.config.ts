import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { firstValueFrom } from 'rxjs';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppInterceptor } from './core/interceptors/app.interceptor';
import { AppSettingsService } from './core/services/app-settings/app-settings.service';

export const appSettingFactory = (configService: AppSettingsService): Promise<void> => {
  return firstValueFrom(configService.loadConfig()).then(
    (config: any) => {
      configService.environment = config;
      console.log(config);
    },
    (error: any) => {
      console.error('Error loading config:', error);
      throw error;
    }
  );
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([AppInterceptor])),
    provideAppInitializer(() => appSettingFactory(inject(AppSettingsService))),
  ]
};
