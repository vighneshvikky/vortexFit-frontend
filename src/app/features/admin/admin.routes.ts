import { Routes } from '@angular/router';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';


export const adminRoutes: Routes = [
  {
    path: 'login',
    component: AdminLoginComponent
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/admin-user-listing/admin-user-listing.component').then(m => m.AdminUserListingComponent),
  }
]; 