import { Routes } from '@angular/router';
import { SignupComponent } from './pages/signup/signup.component';
import { RoleSelectionComponent } from './pages/role-selection/role-selection.component';
import { OtpComponent } from './pages/otp/otp.component';
import { LoginComponent } from './pages/login/login.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { UserDetailsComponent } from '../user/pages/user-details/user-details.component';
import { TrainerVerificationComponent } from '../trainer/pages/trainer-verification/trainer-verification.component';
import { TrainerStatusComponent } from '../trainer/pages/trainer-status/trainer-status.component';

export const authRoutes: Routes = [
  { path: 'role', component: RoleSelectionComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'otp', component: OtpComponent },
  { path: 'login', component: LoginComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'callback', component: LoginComponent },
  { path: 'trainer-requests', component: TrainerVerificationComponent },
  { path: 'user-details', component: UserDetailsComponent },
  { path: 'trainer-status', component: TrainerStatusComponent },
];
