import { Routes } from '@angular/router';
import { MainComponent } from './main/main';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./main/main').then((m) => m.MainComponent),
    },
    {
        path: 'privacy-policy',
        redirectTo: 'privacy-policy.html',
        pathMatch: 'full'
    },
    {
        path: '**',
        pathMatch: 'full',
        redirectTo: '',
    },
];
