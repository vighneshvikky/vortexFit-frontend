import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as UsersActions from './users.actions';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AdminService } from '../../../features/admin/services/admin.service';

@Injectable()
export class UsersEffects {

 private actions$ = inject(Actions);
 private adminService = inject(AdminService)
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
}
