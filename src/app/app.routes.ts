import { Routes } from '@angular/router';

/**
 * Every route is lazy.
 *
 * Note the absence of route `title`s: the router's title strategy would run
 * *after* each page's own `Seo.apply()` and overwrite it, leaving two owners of
 * `document.title`. `Seo` is the single owner.
 *
 * The home page is the only one most visitors see, and it should not pay for
 * the case-study or contact bundles.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'work',
    loadComponent: () => import('./features/work/work').then((m) => m.Work),
  },
  {
    path: 'work/:slug',
    loadComponent: () =>
      import('./features/project-detail/project-detail').then((m) => m.ProjectDetail),
  },
  {
    path: 'resume',
    loadComponent: () => import('./features/resume/resume').then((m) => m.Resume),
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact').then((m) => m.Contact),
  },
  // `/projects` is the path people guess at most; deeper guesses fall through
  // to the 404, which links back into the work index.
  { path: 'projects', redirectTo: 'work', pathMatch: 'full' },
  // Prerendered so the server has a real page to send with a 404 status.
  {
    path: '404',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
