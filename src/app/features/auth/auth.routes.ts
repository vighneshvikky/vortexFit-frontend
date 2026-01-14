import { Routes } from '@angular/router';
import { UnauthenticatedGuard } from '../../core/guards/unauthenticated.guard';

import { SignupComponent } from './pages/signup/signup.component';
import { RoleSelectionComponent } from './pages/role-selection/role-selection.component';
import { OtpComponent } from './pages/otp/otp.component';
import { LoginComponent } from './pages/login/login.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { UserDetailsComponent } from '../user/pages/user-details/user-details.component';
import { TrainerVerificationComponent } from '../trainer/pages/trainer-verification/trainer-verification.component';
import { TrainerStatusComponent } from '../trainer/pages/trainer-status/trainer-status.component';
import { MfaSetupComponent } from './mfa/mfa-setup.component';
import { MfaVerifyComponent } from './mfa/mfa-verify.component';

export const authRoutes: Routes = [
  {
    path: 'role',
    component: RoleSelectionComponent,
    canActivate: [UnauthenticatedGuard],
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [UnauthenticatedGuard],
  },
  { path: 'otp', component: OtpComponent },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [UnauthenticatedGuard],
  },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'callback', component: LoginComponent },
  {
    path: 'trainer-requests',
    component: TrainerVerificationComponent,
    canActivate: [UnauthenticatedGuard],
  },
  { path: 'mfa-setup', component: MfaSetupComponent },
  { path: 'mfa-verify', component: MfaVerifyComponent },

  {
    path: 'user-details',
    component: UserDetailsComponent,
    canActivate: [UnauthenticatedGuard],
  },
  {
    path: 'trainer-status',
    component: TrainerStatusComponent,
    canActivate: [UnauthenticatedGuard],
  },
];
