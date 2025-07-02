// unauthenticated.guard.ts
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { AuthState } from '../../features/auth/store/reducers/auth.reducer';
import { selectCurrentUser } from '../../features/auth/store/selectors/auth.selectors';
import { isTrainer, isUser } from './user-type-guards';

export const UnauthenticatedGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const store = inject(Store<AuthState>);
  const router = inject(Router);

  console.log('[Guard] UnauthenticatedGuard triggered'); // ✅ Must show

  return store.select(selectCurrentUser).pipe(
    take(1),
    map((user) => {
        if(isUser(user) || isTrainer(user)){
      if (user?.isVerified) {
        router.navigate([user.role === 'trainer' ? '/trainer/dashboard' : '/user/dashboard']);
        return false;
      }
        }

      return true;
    })
  );
};
