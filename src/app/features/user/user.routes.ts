import { Routes } from '@angular/router';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { RoleGuard } from '../../core/guards/role.guard';
import { UserLayoutComponent } from '../../shared/components/user/user-layout/user-layout.component';
import { UserTrainerListComponent } from './pages/user-trainer-list/user-trainer-list.component';
import { TrainerInfoComponent } from './pages/trainer-info/trainer-info.component';
import { AllTraninersComponent } from './pages/all-traniners/all-traniners.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { UserBookingComponent } from './pages/user-booking/user-booking.component';
import { UserConfirmBookingComponent } from './pages/user-confirm-booking/user-confirm-booking.component';
import { ChatComponent } from '../../core/chat/chat.component';
import { UserSpecificLayoutComponent } from '../../shared/components/user/user-specific-layout/user-specific-layout.component';
import { MySessionComponent } from './my-session/my-session.component';
import { PlanComponent } from '../../core/plan/plan.component';
import { TransactionsComponent } from '../../core/transactions/transactions.component';
import { NotificationComponent } from '../../core/notification/notification.component';
import { AiChatComponent } from './pages/ai-chat/ai-chat.component';
import { UserProfileDashboardComponent } from './pages/user-profile-dashboard/user-profile-dashboard.component';

export const userRoutes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    canActivate: [RoleGuard()],
    data: { role: 'user' },
    children: [
      { path: 'dashboard', component: UserDashboardComponent },
      { path: 'trainers', component: UserTrainerListComponent },
      { path: 'trainer-info/:id', component: TrainerInfoComponent },
      { path: 'all-trainers', component: AllTraninersComponent },

      {
        path: '',
        component: UserSpecificLayoutComponent,
        children: [
          { path: 'profile', component: UserProfileComponent },
          { path: 'my-sessions', component: MySessionComponent },
          { path: 'plans', component: PlanComponent, data: { role: 'user' } },
          {
            path: 'transactions',
            component: TransactionsComponent,
            data: { role: 'user' },
          },
          {
            path: 'notifications',
            component: NotificationComponent,
            data: { role: 'user' },
          },
          {
            path: 'ask-ai',
            component: AiChatComponent,
          },
          {
            path: 'statistics',
            component: UserProfileDashboardComponent,
          },
          {
            path: 'chat',
            component: ChatComponent,
            data: { role: 'user' },
          },
          {
            path: 'chat/:id',
            component: ChatComponent,
            data: { role: 'user' },
          },
        ],
      },

      { path: 'booking/:id', component: UserBookingComponent },
      { path: 'confirmBooking', component: UserConfirmBookingComponent },
      { path: 'chat/:id', component: ChatComponent, data: { role: 'user' } },
    ],
  },
];
