
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../../../core/services/auth.service';
import { login, loginSuccess, loginFailure } from '../actions/auth.actions';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      switchMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map((user) => loginSuccess({ user })),
          catchError((error) => {
  let errorMsg = 'Login failed';
  if (error.error?.message) {
    errorMsg = error.error.message; 
  } else if (error.message) {
    errorMsg = error.message;
  }
  return of(loginFailure({ error: errorMsg }));
})
        )
      )
    )
  );

  redirectAfterLogin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        map(({ user }) => {
          if (user.role === 'user') {
            this.router.navigate(['/user/dashboard']);
          } else if (user.role === 'trainer') {
            this.router.navigate(['/trainer/trainer-requests']);
          }
        })
      ),
    { dispatch: false }
  );
}
