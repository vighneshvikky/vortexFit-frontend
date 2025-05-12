import { Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { RoleSelectionComponent } from './role-selection/role-selection.component';
import { OtpComponent } from './otp/otp.component';
import { LoginComponent } from './login/login.component';

export const authRoutes: Routes = [
  { path: 'role', component: RoleSelectionComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'otp', component: OtpComponent },
  {path: 'login', component: LoginComponent}
];
