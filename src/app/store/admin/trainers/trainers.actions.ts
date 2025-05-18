// store/admin/trainers/trainers.actions.ts
import { createAction, props } from '@ngrx/store';
import { Trainer } from '../../../features/trainer/models/trainer.interface';
import { GetUsersQuery } from '../../../shared/components/sidebar/sidebar.component';

export const loadUnverifiedTrainers = createAction(
  '[Trainers] Load Unverified Trainers',
  props<{ query: GetUsersQuery }>()
);

export const loadUnverifiedTrainersSuccess = createAction(
  '[Trainers] Load Unverified Trainers Success',
  props<{ trainers: Trainer[] }>()
);

export const loadUnverifiedTrainersFailure = createAction(
  '[Trainers] Load Unverified Trainers Failure',
  props<{ error: string }>()
);

export const loadTrainers = createAction('[Trainers] Load Trainers');
export const loadTrainersSuccess = createAction(
  '[Trainers] Load Trainers Success',
  props<{ trainers: Trainer[] }>()
);
export const loadTrainersFailure = createAction(
  '[Trainers] Load Trainers Failure',
  props<{ error: any }>()
);

export const acceptTrainer = createAction(
  '[Trainers] Accept Trainer',
  props<{ trainerId: string }>()
);

export const acceptTrainerSuccess = createAction(
  '[Trainers] Accept Trainer Success',
  props<{ trainer: Trainer }>()
);

export const acceptTrainerFailure = createAction(
  '[Trainers] Accept Trainer Failure',
  props<{ error: any }>()
);

export const rejectTrainer = createAction(
  '[Trainers] Reject Trainer',
  props<{ trainerId: string; reason: string }>()
);

export const rejectTrainerSuccess = createAction(
  '[Trainers] Reject Trainer Success',
  props<{ trainer: Trainer }>()
);

export const rejectTrainerFailure = createAction(
  '[Trainers] Reject Trainer Failure',
  props<{ error: any }>()
);

