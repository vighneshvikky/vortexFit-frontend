import { Routes } from '@angular/router';
import { TrainerDashboardComponent } from './pages/trainer-dashboard/trainer-dashboard.component';
import { TrainerVerificationComponent } from './pages/trainer-verification/trainer-verification.component';
import { TrainerStatusComponent } from './pages/trainer-status/trainer-status.component';
import { RoleGuard } from '../../core/guards/role.guard';
export const trainerRoutes: Routes = [
  {
    path: 'dashboard',
    component: TrainerDashboardComponent,
    canActivate: [RoleGuard()],
    data: { role: 'trainer' },
  },
  {
    path: 'trainer-requests',
    component: TrainerVerificationComponent,
    canActivate: [RoleGuard()],
    data: { role: 'trainer' },
  },
  {
    path: 'trainer-status',
    component: TrainerStatusComponent,
    canActivate: [RoleGuard()],
    data: { role: 'trainer' },
  },
];
