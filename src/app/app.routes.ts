import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'hire-me',
    loadComponent: () => import('./pages/hire-me/hire-me').then(m => m.HireMe),
    title: 'Hire Me | Rabin R — Freelance Angular Developer'
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog').then(m => m.Blog),
    title: 'Blog | Angular Insights by Rabin R'
  },
  { path: '**', redirectTo: '' }
];
