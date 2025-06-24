import { createAction, props } from '@ngrx/store';
import {
  GetUsersParams,
  User,
} from '../../../features/admin/services/admin.service';
import { PaginatedResponse } from '../../../features/admin/services/admin.service';
import { Trainer } from '../../../features/trainer/models/trainer.interface';

export const loadUsers = createAction(
  '[User] Load Users',
  props<{ params: GetUsersParams }>()
);

export const resetUsersLoaded = createAction('[Users] Reset Users Loaded');

export const loadUsersSuccess = createAction(
  '[User] Load Users Success',
  props<{ response: PaginatedResponse<User | Trainer> }>()
);

export const loadUsersFailure = createAction(
  '[User] Load Users Failure',
  props<{ error: any }>()
);

export const toggleBlockAndLoadUsers = createAction(
  '[User] Toggle Block And Load Users',
  props<{ userId: string; role: string; params: GetUsersParams }>()
);

// export const toggleBlockAndLoadUsersSuccess = createAction(
//   '[User] Toggle Block And Load Users Success',
//   props<{ response: PaginatedResponse<User | Trainer> }>()
// );

export const toggleBlockStatusSuccess = createAction(
  '[Users] Toggle Block Status Success',
  props<{ updatedUser: User | Trainer }>()
);

export const toggleBlockAndLoadUsersFailure = createAction(
  '[User] Toggle Block And Load Users Failure',
  props<{ error: any }>()
);
