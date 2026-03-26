import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./layout/main.component').then(m => m.MainComponent) },
  { path: '**', redirectTo: '' }
];
