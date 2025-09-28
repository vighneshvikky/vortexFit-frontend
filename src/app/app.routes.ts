import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'user',
    loadChildren: () =>
      import('../app/features/user/user.routes').then((m) => m.userRoutes),
  },
  {
    path: 'trainer',
    loadChildren: () =>
      import('../app/features/trainer/trainer.routes').then(
        (m) => m.trainerRoutes
      ),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('../app/features/admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: 'blocked',
    loadComponent: () =>
      import('../app/shared/components/blocked/blocked.component').then(
        (m) => m.BlockedComponent
      ),
  },
  {
    path: '',
    redirectTo: 'auth/role',
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () =>
      import('../app/shared/components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
