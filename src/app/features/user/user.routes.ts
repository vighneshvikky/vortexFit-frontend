import { Routes } from '@angular/router';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { RoleGuard } from '../../core/guards/role.guard';
import { UserLayoutComponent } from '../../shared/components/user/user-layout/user-layout.component';
import { UserTrainerListComponent } from './pages/user-trainer-list/user-trainer-list.component';
import { TrainerInfoComponent } from '../trainer/pages/trainer-info/trainer-info.component';
export const userRoutes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    canActivate: [RoleGuard()],
    data: {role: 'user'},
    children: [
      {path: 'dashboard', component: UserDashboardComponent},
      {path: 'trainers', component: UserTrainerListComponent},
      {path: 'trainer-info/:id', component: TrainerInfoComponent}
    ]
  }
];
