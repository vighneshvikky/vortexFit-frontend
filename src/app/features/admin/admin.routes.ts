import { Routes } from '@angular/router';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { RoleGuard } from '../../core/guards/role.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'verifications',
        loadComponent: () =>
          import(
            './pages/admin-trainer-verification/admin-trainer-verification.component'
          ).then((m) => m.AdminTrainerVerificationComponent),
        canActivate: [RoleGuard()],
        data: { role: 'admin' },
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
        canActivate: [RoleGuard()],
        data: { role: 'admin' },
      },
      {
        path: 'users',
        loadComponent: () =>
          import(
            './pages/admin-user-listing/admin-user-listing.component'
          ).then((m) => m.AdminUserListingComponent),
        canActivate: [RoleGuard()],
        data: { role: 'admin' },
      },
      {
        path: 'plans',
        loadComponent: () =>
          import('./pages/admin-plan/admin-plan.component').then(
            (m) => m.AdminPlanComponent
          ),
        canActivate: [RoleGuard()],
        data: { role: 'admin' },
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('../../core/transactions/transactions.component').then(
            (m) => m.TransactionsComponent
          ),
        canActivate: [RoleGuard()],
        data: { role: 'admin' },
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'login',
    component: AdminLoginComponent,
  },
];
