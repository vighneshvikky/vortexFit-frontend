import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'user',
    loadChildren: () => import('../app/features/user/user.routes').then((m) => m.userRoutes)
  },
  {
    path: 'trainer',
    loadChildren: () => import('../app/features/trainer/trainer.routes').then((m) => m.trainerRoutes)
  },
  {
    path: '',
    redirectTo: 'auth/role',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'auth/role',
  },
];
