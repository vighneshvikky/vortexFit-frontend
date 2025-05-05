import { Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { RoleSelectionComponent } from './role-selection/role-selection.component';

export const authRoutes: Routes = [

  { path: 'role', component: RoleSelectionComponent },
  { path: 'signup', component: SignupComponent },
];
