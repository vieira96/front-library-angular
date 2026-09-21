import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-layout').then((m) => m.AdminLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'authors',
        loadComponent: () =>
          import('./authors/authors').then((m) => m.Authors),
      },
      {
        path: 'books',
        loadComponent: () =>
          import('./books/books').then((m) => m.Books),
      },
    ],
  },
];
