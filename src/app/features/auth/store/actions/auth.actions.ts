import { createAction, props } from '@ngrx/store';
import { Trainer } from '../../../trainer/models/trainer.interface';
import { User } from '../../../admin/services/admin.service';
import { Admin } from '../../../admin/models/admin.interface';

export type AuthenticatedUser = User | Trainer | Admin;

export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string, role: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: AuthenticatedUser }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');

export const updateTrainerProfileSuccess = createAction(
  '[Auth] Update Trainer Profile Success',
  props<{ updatedTrainer: Trainer }>()
);
