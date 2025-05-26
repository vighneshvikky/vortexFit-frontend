import { Routes } from '@angular/router';
import { SignupComponent } from './pages/signup/signup.component';
import { RoleSelectionComponent } from './pages/role-selection/role-selection.component';
import { OtpComponent } from './pages/otp/otp.component';
import { LoginComponent } from './pages/login/login.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { UserDashboardComponent } from '../user/pages/user-dashboard/user-dashboard.component';
import { UserDetailsComponent } from '../user/pages/user-details/user-details.component';

export const authRoutes: Routes = [
  { path: 'role', component: RoleSelectionComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'otp', component: OtpComponent },
  { path: 'login', component: LoginComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'callback', component: LoginComponent },
 
];
