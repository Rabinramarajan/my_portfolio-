import { AppSettingsService } from './common/services/app-settings/app-settings.service';
import { firstValueFrom } from 'rxjs';

export function appInitializerFactory(appSettingsService: AppSettingsService): () => Promise<void> {
  return async () => {
    try {
      const [environmentConfig, userConfig] = await Promise.all([
        firstValueFrom(appSettingsService.loadConfig()), // Load environment config
        firstValueFrom(appSettingsService.loadUserData()) // Load user data
      ]);

      console.log('App Config Loaded:', environmentConfig, userConfig);

      appSettingsService.environment = environmentConfig;
      appSettingsService.userData = userConfig;
    } catch (error) {
      console.error('Error during app configuration initialization:', error);
      throw error; 
    }
  };
}
