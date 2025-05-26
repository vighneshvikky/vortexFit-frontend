// src/app/core/init/app.initializer.ts
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { setUser } from '../../features/auth/store/actions/auth.actions';
import { catchError, tap } from 'rxjs/operators';
import { of, firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

export function initializeApp(): () => Promise<void> {
  return async () => {
    const authService = inject(AuthService);
    const store = inject(Store);

    try {
      const user = await firstValueFrom(
        authService.getCurrentUser().pipe( // This should call your `/auth/me` route
          tap(user => {
            store.dispatch(setUser({ user }));
          }),
          catchError(() => {
            // Handle unauthenticated or error state
            return of(null);
          })
        )
      );
    } catch (err) {
      console.error('App initialization failed', err);
    }
  };
}
