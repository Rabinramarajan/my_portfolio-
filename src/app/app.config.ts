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
import { AppTitleStrategy, VercelService, WebVitalsService } from './core/services';
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
    // Reuses the prerendered DOM instead of discarding and re-rendering it, and
    // — via the default HTTP transfer cache — inlines the JSON the pages fetch
    // into the HTML. Without this the prerender buys nothing: the client blanks
    // the page on boot and re-fetches profile.json/home.json before the hero can
    // paint, which is what held LCP at 3.5s.
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
      // Registering only once the app is stable keeps the worker's own fetches
      // off the critical path, so it cannot compete with the first paint.
      registrationStrategy: 'registerWhenStable:30000',
    }),
    VercelService,
    WebVitalsService,
    provideAppInitializer(activateUpdatesOnNextLoad),
    provideAppInitializer(initializeVercel),
  ],
};
