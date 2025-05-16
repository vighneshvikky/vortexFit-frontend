// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { Store } from '@ngrx/store';
// import { map, take } from 'rxjs/operators';
// import { selectCurrentUser } from '../../features/auth/store/selectors/auth.selectors';

// export const roleGuard: CanActivateFn = (route) => {
//   const store = inject(Store);
//   const router = inject(Router);
//   const requiredRole = route.data['role'];

//   return store.select(selectCurrentUser).pipe(
//     take(1),
//     map(user => {
//       if (user && user.role === requiredRole) {
//         return true;
//       }
      
      
//       router.navigate(['/auth/login'], { 
//         queryParams: { 
//           role: requiredRole,
//           returnUrl: router.url 
//         }
//       });
//       return false;
//     })
//   );
// }; 