// role.guard.ts
import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthState } from '../../features/auth/store/auth.state';
import { selectCurrentUser } from '../../features/auth/store/selectors/auth.selectors';
import { map, take } from 'rxjs/operators';

export function RoleGuard(allowedRoles: string[]): CanActivateFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const store = inject(Store<AuthState>);
    const router = inject(Router);

    return store.select(selectCurrentUser).pipe(
      take(1),
      map((user) => {
        if (user && allowedRoles.includes(user.role)) {
          return true;
        } else {
          router.navigate(['']);
          return false;
        }
      })
    );
  };
}
