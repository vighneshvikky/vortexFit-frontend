
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


export function RoleGuard(): CanActivateFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const store = inject(Store<AuthState>);
    const router = inject(Router);
    const allowedRoles = route.data['role'] as string | string[];
    return store.select(selectCurrentUser).pipe(
      take(1),
      map((user) => {
        if (!user) {
          router.navigate(['']);
          return false;
        }

        const rolesArray = Array.isArray(allowedRoles)
          ? allowedRoles
          : [allowedRoles];

        const hasRole = rolesArray.includes(user.role);

        if (!hasRole) {
          router.navigate(['']);
          return false;
        }

        if (
          (user.role === 'trainer' || user.role === 'user') &&
          user.isBlocked
        ) {
          console.log('User is blocked');
          router.navigate(['/blocked']);
          return false;
        }

        if (user.role === 'trainer' && !user.isVerified) {
          router.navigate(['/trainer/trainer-requests']);
          return false;
        }

        return true;
      })
    );
  };
}
