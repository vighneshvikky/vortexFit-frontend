import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as UsersActions from './users.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AdminService } from '../../../features/admin/services/admin.service';

@Injectable()
export class UsersEffects {
  private actions$ = inject(Actions);
  private adminService = inject(AdminService);
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUsers),
      switchMap(({ params }) =>
        this.adminService.getUsers(params).pipe(
          tap((response) => console.log('response for user listing', response)),
          map((response) => UsersActions.loadUsersSuccess({ response })),
          catchError((error) => of(UsersActions.loadUsersFailure({ error })))
        )
      )
    )
  );

loadUnverifiedTrainers$ = createEffect(() =>
  this.actions$.pipe(
    ofType(UsersActions.loadUnverifiedTrainers),
    switchMap(({ query }) =>
      this.adminService.getUnverifiedTrainers(query).pipe(
        tap((response) => console.log('Unverified Trainers Response:', response)),
        map((response) =>
          UsersActions.loadUnverifiedTrainersSuccess({ response })
        ),
        catchError((error) =>
          of(UsersActions.loadUnverifiedTrainersFailure({ error }))
        )
      )
    )
  )
);




  toggleBlockStatus$ = createEffect(() =>
  this.actions$.pipe(
    ofType(UsersActions.toggleBlockAndLoadUsers),
    switchMap(({ userId, role }) =>
      this.adminService.toggleBlockStatus(userId, role).pipe(
        map((updatedUser) =>
          UsersActions.toggleBlockStatusSuccess({ updatedUser })
        ),
        catchError((error) =>
          of(UsersActions.toggleBlockAndLoadUsersFailure({ error }))
        )
      )
    )
  )
);

}
