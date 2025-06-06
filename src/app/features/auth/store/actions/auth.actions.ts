import { createAction, props } from '@ngrx/store';
import { Trainer } from '../../../trainer/models/trainer.interface';
import { User } from '../../../admin/services/admin.service';
import { Admin } from '../../../admin/models/admin.interface';

export type AuthenticatedUser = User | Trainer | Admin;

export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string; role: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: AuthenticatedUser }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const googleLogin = createAction(
  '[Auth] Google Login',
  props<{ role: 'user' | 'trainer' }>()
);

export const logout = createAction('[Auth] Logout');

export const updateTrainerProfileSuccess = createAction(
  '[Auth] Update Trainer Profile Success',
  props<{ updatedTrainer: Trainer }>()
);

export const updateCurrentUserVerificationStatus = createAction(
  '[Auth] Update Current User Verification Status',
  props<{ status: 'pending' | 'approved' | 'rejected' }>()
);

export const updateCurrentUserRejectionReason = createAction(
  '[Auth Update Current User Verification Status]',
  props<{ reason: string }>()
);

export const fetchCurrentUser = createAction('[Auth] Fetch Current User');

export const fetchCurrentUserSuccess = createAction(
  '[Auth]  Fetch Current User Success',
  props<{ user: User | Trainer }>()
);

export const updateCurrentUser = createAction(
  '[Auth] Update Current User',
  props<{ user: User | Trainer }>()
);

export const setUser = createAction(
  '[Auth] Set User',
  props<{ user: User | Trainer }>()
);
