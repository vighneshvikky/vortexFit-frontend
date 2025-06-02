import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as UsersActions from './users.actions';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { AdminService } from '../../../features/admin/services/admin.service';
import { Store } from '@ngrx/store';

@Injectable()
export class UsersEffects {
  private actions$ = inject(Actions);
  private adminService = inject(AdminService);
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUsers),
      switchMap(({ params }) =>
        this.adminService.getUsers(params).pipe(
          map((response) => UsersActions.loadUsersSuccess({ response })),
          catchError((error) => of(UsersActions.loadUsersFailure({ error })))
        )
      )
    )
  );

  toggleBlockAndLoadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.toggleBlockAndLoadUsers),
      switchMap(({ userId, role, params }) =>
        this.adminService
          .toggleBlockStatusAndFetchUsers(userId, role, params)
          .pipe(
            map((response) =>
              UsersActions.toggleBlockAndLoadUsersSuccess({ response })
            ),
            catchError((error) =>
              of(UsersActions.toggleBlockAndLoadUsersFailure({ error }))
            )
          )
      )
    )
  );
}
