import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../../../core/services/auth.service';
import { AdminService, User, AdminLoginResponse } from '../../../admin/services/admin.service';
import { login, loginSuccess, loginFailure, AuthenticatedUser } from '../actions/auth.actions';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Trainer } from '../../../trainer/models/trainer.interface';
import { Admin } from '../../../admin/models/admin.interface';
import { LoginResponse } from '../../../../core/interfaces/auth/login-response.model';
import { ApiResponse } from '../../../../core/models/api-response.model';

// Assuming you have these interfaces somewhere:
// import { User } from '../../../models/user.model';
// import { Trainer } from '../../../models/trainer.model';
// import { Admin } from '../../../models/admin.model';

type UserRole = 'user' | 'trainer' | 'admin';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      switchMap((action) => {
        const { email, password, role } = action;
        console.log('login data from fe action', action)
        // For admin, use admin service directly
        if (role === 'admin') {
          return this.adminService.login({ email, password }).pipe(
            map((response: AdminLoginResponse) => {
              const admin: Admin = {
                id: response.id,
                email: response.email,
                role: 'admin'
              };
              return loginSuccess({ user: admin });
            }),
            catchError((error) => {
              let errorMsg = 'Admin login failed';
              if (error.error?.message) {
                errorMsg = error.error.message;
              } else if (error.message) {
                errorMsg = error.message;
              }
              return of(loginFailure({ error: errorMsg }));
            })
          );
        }

        // For user/trainer
        return this.authService.login({ email, password, role: role as 'user' | 'trainer' }).pipe(
          map((response: LoginResponse) => {
            if (!response) {
              throw new Error('No response received');
            }
            return loginSuccess({ user: response });
          }),
          catchError((error) => {
            let errorMsg = 'Login failed';
            if (error.error?.message) {
              errorMsg = error.error.message;
            } else if (error.message) {
              errorMsg = error.message;
            }
            return of(loginFailure({ error: errorMsg }));
          })
        );
      })
    )
  );

  redirectAfterLogin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        map(({ user }) => {
          if (!user || !user.role) {
            console.error('User or role is undefined:', user);
            return;
          }

          const role = user.role as UserRole;
          switch (role) {
            case 'user':
              this.router.navigate(['/user/dashboard']);
              break;
            case 'trainer':
              this.router.navigate(['/trainer/trainer-requests']);
              break;
            case 'admin':
              this.router.navigate(['/admin/dashboard']);
              break;
            default:
              console.error('Unknown role:', role);
              break;
          }
        })
      ),
    { dispatch: false }
  );
}
