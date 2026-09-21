import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guard/auth.guard';
import { adminGuard } from './core/auth/guard/admin.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/notification/notifications').then((m) => m.Notifications),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/home/home').then((m) => m.Home),
  },
];
