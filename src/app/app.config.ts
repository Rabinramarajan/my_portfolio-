import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
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
import { AppTitleStrategy } from './core/services';

/**
 * Swaps in a new build as soon as one is cached, so the next page load runs it.
 *
 * Without this the worker serves the installed version indefinitely and a
 * visitor can sit on a stale build long after a deploy. It deliberately does
 * not force a reload — yanking the page out from under someone mid-read costs
 * more than showing them the previous version for one more visit.
 */
function activateUpdatesOnNextLoad(): void {
  const updates = inject(SwUpdate);
  if (!updates.isEnabled) return;

  updates.versionUpdates.subscribe((event) => {
    if (event.type === 'VERSION_READY') void updates.activateUpdate();
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    // Reuses the prerendered DOM instead of discarding and re-rendering it, and
    // — via the default HTTP transfer cache — inlines the JSON the pages fetch
    // into the HTML. Without this the prerender buys nothing: the client blanks
    // the page on boot and re-fetches profile.json/home.json before the hero can
    // paint, which is what held LCP at 3.5s.
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
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
    provideAppInitializer(activateUpdatesOnNextLoad),
  ],
};
