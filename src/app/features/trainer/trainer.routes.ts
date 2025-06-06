import { Routes } from '@angular/router';
import { TrainerDashboardComponent } from './pages/trainer-dashboard/trainer-dashboard.component';
import { TrainerVerificationComponent } from './pages/trainer-verification/trainer-verification.component';
import { TrainerStatusComponent } from './pages/trainer-status/trainer-status.component';
import { RoleGuard } from '../../core/guards/role.guard';
import { TrainerProfileComponent } from './pages/trainer-profile/trainer-profile.component';
import { TrainerLayoutComponent } from '../../shared/components/trainer/trainer-layout/trainer-layout.component';
export const trainerRoutes: Routes = [
  {
    path: '',
    component: TrainerLayoutComponent,
    canActivate: [RoleGuard()],
    data: { role: 'trainer' },
    children: [
      { path: 'dashboard', component: TrainerDashboardComponent },
      { path: 'trainer-requests', component: TrainerVerificationComponent },
      { path: 'trainer-status', component: TrainerStatusComponent },
      { path: 'profile', component: TrainerProfileComponent },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
