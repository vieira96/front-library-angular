import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'authors',
    loadComponent: () =>
      import('./authors/authors').then((m) => m.Authors),
  },
  {
    path: '',
    redirectTo: 'authors',
    pathMatch: 'full',
  },
];
