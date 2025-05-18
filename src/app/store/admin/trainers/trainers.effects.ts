// store/admin/trainers/trainers.effects.ts
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AdminService } from '../../../features/admin/services/admin.service';
import * as TrainerActions from './trainers.actions';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class TrainersEffects {


private actions$ = inject(Actions);
private adminService = inject(AdminService);

  loadUnverifiedTrainers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrainerActions.loadUnverifiedTrainers),
      mergeMap(({ query }) =>
        this.adminService.getUnverifiedTrainers(query).pipe(
          map((response) =>
            TrainerActions.loadUnverifiedTrainersSuccess({
              trainers: response.data,
            })
          ),
          catchError((error) =>
            of(TrainerActions.loadUnverifiedTrainersFailure({ error: error.message }))
          )
        )
      )
    )
  );

  acceptTrainer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrainerActions.acceptTrainer),
      mergeMap(({ trainerId }) =>
        this.adminService.acceptTrainer(trainerId).pipe(
          map((trainer) => TrainerActions.acceptTrainerSuccess({ trainer })),
          catchError((error) =>
            of(TrainerActions.acceptTrainerFailure({ error: error.message }))
          )
        )
      )
    )
  );

  rejectTrainer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrainerActions.rejectTrainer),
      mergeMap(({ trainerId, reason }) =>
        this.adminService.rejectTrainer(trainerId, reason).pipe(
          map((trainer) => TrainerActions.rejectTrainerSuccess({ trainer })),
          catchError((error) =>
            of(TrainerActions.rejectTrainerFailure({ error: error.message }))
          )
        )
      )
    )
  );
  
}
