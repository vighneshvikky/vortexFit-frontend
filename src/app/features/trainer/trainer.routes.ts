import { Routes } from '@angular/router';
import { TrainerDashboardComponent } from './pages/trainer-dashboard/trainer-dashboard.component';
import { TrainerVerificationComponent } from './pages/trainer-verification/trainer-verification.component';
import { RoleGuard } from '../../core/guards/role.guard';
import { TrainerProfileComponent } from './pages/trainer-profile/trainer-profile.component';
import { TrainerLayoutComponent } from '../../shared/components/trainer/trainer-layout/trainer-layout.component';
import { TrainerSchedulingComponent } from './pages/trainer-scheduling/trainer-scheduling.component';
import { TrainerSessionComponent } from './pages/trainer-session/trainer-session.component';
import { ChatComponent } from '../../core/chat/chat.component';
import { PlanComponent } from '../../core/plan/plan.component';
import { TransactionsComponent } from '../../core/transactions/transactions.component';
import { NotificationComponent } from '../../core/notification/notification.component';

export const trainerRoutes: Routes = [
  {
    path: '',
    component: TrainerLayoutComponent,
    canActivate: [RoleGuard()],
    data: { role: 'trainer' },
    children: [
      { path: 'dashboard', component: TrainerDashboardComponent },
      { path: 'trainer-requests', component: TrainerVerificationComponent },
      { path: 'profile', component: TrainerProfileComponent },
      { path: 'scheduling', component: TrainerSchedulingComponent },
      { path: 'chat/:id', component: ChatComponent, data: { role: 'trainer' } },
      { path: 'chat', component: ChatComponent, data: { role: 'trainer' } },
      { path: 'sessions', component: TrainerSessionComponent },
      { path: 'plans', component: PlanComponent, data: { role: 'trainer' } },
      {
        path: 'notifications',
        component: NotificationComponent,
        data: { role: 'trainer' },
      },
      {
        path: 'transactions',
        component: TransactionsComponent,
        data: { role: 'trainer' },
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
