import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface EmailJsConfig {
  readonly serviceId: string;
  readonly templateId: string;
  readonly publicKey: string;
}

export interface AppConfig {
  readonly production: boolean;
  readonly dataBasePath: string;
  readonly emailjs: EmailJsConfig;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: (): AppConfig => ({
    production: environment.production,
    dataBasePath: environment.dataBasePath,
    emailjs: {
      serviceId: environment.emailjs.serviceId,
      templateId: environment.emailjs.templateId,
      publicKey: environment.emailjs.publicKey,
    },
  }),
});
