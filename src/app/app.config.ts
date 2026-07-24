import {
  ApplicationConfig,
  DestroyRef,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideServiceWorker, SwUpdate } from '@angular/service-worker';
import { routes } from './app.routes';
import {
  AppSettingsService,
  AppTitleStrategy,
  STORAGE_CONFIG,
  VercelService,
  WebVitalsService,
} from './core/services';
import { provideZvIcons } from '@zellavora/icons';

function activateUpdatesOnNextLoad(): void {
  const updates = inject(SwUpdate);
  const destroyRef = inject(DestroyRef);
  if (!updates.isEnabled) return;

  updates.versionUpdates.pipe(takeUntilDestroyed(destroyRef)).subscribe((event) => {
    if (event.type === 'VERSION_READY') void updates.activateUpdate();
  });
}

function initializeVercel(): void {
  inject(VercelService);
  inject(WebVitalsService);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZvIcons(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),

    provideClientHydration(withEventReplay()),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({ skipInitialTransition: true }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    VercelService,
    WebVitalsService,
    provideAppInitializer(activateUpdatesOnNextLoad),
    provideAppInitializer(initializeVercel),
    {
      provide: STORAGE_CONFIG,
      useFactory: () => {
        const settings = inject(AppSettingsService);
        return {
          prefix: 'rabin-portfolio.',
          encryptionKey: settings.storageKey,
          encryptByDefault: true,
          encryptIndexedDb: false,
          dbName: 'rabin-portfolio-db',
          dbVersion: 2,
          storeName: 'keyval',
          stores: ['keyval', 'documents', 'audit'],
          defaultBackend: 'local' as const,
          defaultTtl: 0,
          channel: 'rabin-portfolio-storage',
          cleanupInterval: 60_000,
        };
      },
    },
  ],
};
