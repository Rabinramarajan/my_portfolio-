import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
  withViewTransitions,
} from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      // Route params bind straight to component inputs — no ActivatedRoute
      // subscriptions needed for `:slug`.
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      // Native cross-document-style transitions; the browser no-ops these when
      // the user prefers reduced motion.
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition }) => {
          // Capturing the fullscreen mobile menu mid-animation crashes WebKit.
          // Those navigations already have the menu's own close animation to
          // carry them, so the page transition is no loss.
          if (document.querySelector('#mobile-menu.is-open')) transition.skipTransition();
        },
      }),
      // The site is small enough that preloading everything after the first
      // paint is cheaper than a spinner on the second navigation.
      withPreloading(PreloadAllModules),
    ),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
  ],
};
