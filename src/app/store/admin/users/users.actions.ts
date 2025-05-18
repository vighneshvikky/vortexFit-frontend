import { createAction, props } from '@ngrx/store';
import { GetUsersParams, User } from '../../../features/admin/services/admin.service';
import { PaginatedResponse } from '../../../features/admin/services/admin.service';
import { Trainer } from '../../../features/trainer/models/trainer.interface';

export const loadUsers = createAction(
  '[User] Load Users',
  props<{ params: GetUsersParams }>()
);

export const loadUsersSuccess = createAction(
  '[User] Load Users Success',
  props<{ response: PaginatedResponse<User | Trainer> }>()
);

export const loadUsersFailure = createAction(
  '[User] Load Users Failure',
  props<{ error: any }>()
);
