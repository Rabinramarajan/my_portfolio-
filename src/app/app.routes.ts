import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'hire-me',
    loadComponent: () => import('./pages/hire-me/hire-me').then(m => m.HireMe),
    title: 'Hire Me | Rabin R — Senior Frontend Engineer'
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
    path: 'design',
    loadComponent: () => import('./pages/design-system/design-system').then(m => m.DesignSystemComponent),
    title: 'Design System | Rabin R',
    data: { description: 'Living design system: standardized components, tokens, and patterns.' }
  },
  {
    path: 'zellavora',
    loadComponent: () => import('./pages/zellavora/zellavora').then(m => m.Zellavora),
    title: 'Zellavora | Founder',
    data: { description: 'Zellavora: building Zellavora UI (Angular component library) and AI Resume Builder.' }
  },
  { path: '**', redirectTo: '' }
];
