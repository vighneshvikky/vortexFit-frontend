import { createAction, props } from '@ngrx/store';
import { User } from '../../../user/models/user.interface';
import { Trainer } from '../../../trainer/models/trainer.interface';

export const login = createAction(
  '[Auth] Login',
  props<{ credentials: { email: string; password: string } }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User | Trainer }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);
