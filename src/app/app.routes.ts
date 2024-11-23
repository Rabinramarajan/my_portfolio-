import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./main/main').then((m) => m.MainComponent),
    },
    {
        path: 'privacy-policy',
        loadComponent: () => import('./common/templates/privacy-policy').then((m) => m.PrivacyPolicyComponent),
    },
    {
        path: '**',
        pathMatch: 'full',
        redirectTo: '',
    },
];
