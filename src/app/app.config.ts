import { ApplicationConfig, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { RouteReuseService } from './common/services/route-reuse/route-reuse.service';
import { environment } from '../environment/environment';
import { inject as vercelInject } from '@vercel/analytics';
import { appInitializerFactory } from './app.config.initializer';
import { provideStore } from '@ngrx/store';  // Import NgRx's provideStore 
import { appReducer } from './state/app.reducer';

if (environment.production && environment.enableAnalytics) {
  vercelInject();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    { provide: RouteReuseStrategy, useClass: RouteReuseService },
    provideAppInitializer(appInitializerFactory()), 
    provideStore({ app: appReducer }), 
  ]
};
