import { Routes } from '@angular/router';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { UserDetailsComponent } from './pages/user-details/user-details.component';
// import { roleGuard } from "../../core/guards/role.guard";

export const userRoutes: Routes = [
  {
    path: 'dashboard',
    component: UserDashboardComponent,

    data: { role: 'user' },
  },
  {
    path: 'user-details',
    component: UserDetailsComponent,
  },
];
