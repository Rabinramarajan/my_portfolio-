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
  {
    path: 'blog/:slug',
    loadComponent: () => import('./pages/blog-detail/blog-detail').then(m => m.BlogDetail),
    title: 'Article | Rabin R'
  },
  {
    path: 'projects/:slug',
    loadComponent: () => import('./pages/project-detail/project-detail').then(m => m.ProjectDetail),
    title: 'Case Study | Rabin R'
  },
  {
    path: 'styleguide',
    loadComponent: () => import('./pages/styleguide/styleguide').then(m => m.Styleguide),
    title: 'Design System | Rabin R'
  },
  { path: '**', redirectTo: '' }
];
