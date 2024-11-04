import { Routes } from '@angular/router';
import { PrivacyPolicyComponent } from './common/templates/privacy-policy';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./main/main').then((m) => m.MainComponent),
    },
    { path: 'privacy-policy', component: PrivacyPolicyComponent },
    {
        path: '**',
        pathMatch: 'full',
        redirectTo: '',
    },
];
