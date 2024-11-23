import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppSettingsService } from './common/services/app-settings/app-settings.service';


export function appInitializerFactory(): () => Promise<void> {
  return async () => {
    const configService = inject(AppSettingsService);
    try {
      const [environmentConfig, userConfig] = await Promise.all([
        firstValueFrom(configService.loadConfig()),
        firstValueFrom(configService.loadUserData()),
      ]);

      console.log('App Config Loaded:', environmentConfig, userConfig);

      configService.environment = environmentConfig;
      configService.userData = userConfig;
    } catch (error) {
      console.error('Error during app configuration initialization:', error);
      throw error;
    }
  };
}
