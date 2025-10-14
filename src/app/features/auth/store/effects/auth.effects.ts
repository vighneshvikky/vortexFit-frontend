import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../../../core/services/auth.service';
import {
  AdminService,
  User,
  AdminLoginResponse,
} from '../../../admin/services/admin.service';
import {
  login,
  loginSuccess,
  loginFailure,
  googleLogin,
  logout,
  logoutSuccess,
  logoutFailure,
} from '../actions/auth.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { Admin } from '../../../admin/models/admin.interface';

import { NotyService } from '../../../../core/services/noty.service';
import { Trainer } from '../../../trainer/models/trainer.interface';
import { environment } from '../../../../../environments/environment';


type UserRole = 'user' | 'trainer' | 'admin';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private notyService = inject(NotyService);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      switchMap((action) => {
        const { email, password, role } = action;
        if (role === 'admin') {
          return this.adminService.login({ email, password }).pipe(
            map((response: AdminLoginResponse) => {
              console.log('response', response);
              const admin: Admin = {
                _id: response.data._id,
                email: response.data.email,
                role: 'admin',
              };
              console.log('admin data from backend', admin);
              return loginSuccess({ user: admin });
            }),
            catchError((error) => {
              let errorMsg = 'Admin login failed';
              if (error.error?.message) {
                errorMsg = error.error.message;
              } else if (error.message) {
                errorMsg = error.message;
              }
              this.notyService.showError(errorMsg);
              return of(loginFailure({ error: errorMsg }));
            })
          );
        }

        return this.authService
          .login({ email, password, role: role as 'user' | 'trainer' })
          .pipe(
            map((response) => {
              if (!response) {
                throw new Error('No response received');
              }
              return loginSuccess({ user: response.user });
            }),
            catchError((error) => {
              let errorMsg = 'Login failed';
              if (error.error?.message) {
                errorMsg = error.error.message;
              } else if (error.message) {
                errorMsg = error.message;
              }
              this.notyService.showError(errorMsg);
              return of(loginFailure({ error: errorMsg }));
            })
          );
      })
    )
  );

  googleLogin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(googleLogin),
        tap(({ role }) => {
          console.log('role', role)
          console.log('${environment.api}/auth/google/redirect?role=${role}', `${environment.api}/auth/google/redirect?role=${role}`);
          window.location.href = `${environment.api}/auth/google/redirect?role=${role}`;
        })
      ),
    { dispatch: false }
  );

  redirectAfterLogin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(({ user }) => {
          if (!user || !user.role) {
            this.notyService.showError('Invalid user data received');
            return;
          }

          const role = user.role as UserRole;
          if (role === 'trainer' || role === 'user') {
            const verifiedUser = user as User | Trainer;
            if (verifiedUser.isVerified) {
              const dashboardRoute =
                role === 'trainer' ? '/trainer/dashboard' : '/user/dashboard';
              this.router.navigate([dashboardRoute]);
            } else if (
              verifiedUser.verificationStatus === 'rejected' ||
              verifiedUser.verificationStatus === 'requested'
            ) {
              this.router.navigate(['/auth/trainer-status']);
            } else {
              const requestRoute =
                role === 'trainer'
                  ? '/auth/trainer-requests'
                  : '/auth/user-details';

              this.router.navigate([requestRoute]);
            }
          } else if (role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.notyService.showError('Invalid user role');
          }
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      switchMap(() =>
        this.authService.logout().pipe(
          map((response) =>
            logoutSuccess({ role: (response as { role: string }).role })
          ),
          catchError((error) => {
            const errorMsg =
              error?.error?.message || error?.message || 'Logout failed';
            this.notyService.showError(errorMsg);
            return of(logoutFailure({ error: errorMsg }));
          })
        )
      )
    )
  );

  redirectAfterLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logoutSuccess),
        tap(({ role }) => {
          if (role === 'admin') {
            this.router.navigate(['/admin/login']);
          } else {
            this.router.navigate(['/auth/login'], { queryParams: { role } });
          }
        })
      ),
    { dispatch: false }
  );
}
