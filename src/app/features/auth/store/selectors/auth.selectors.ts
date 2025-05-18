import { createSelector } from '@ngrx/store';
import { AuthState } from '../reducers/auth.reducer';
import { Trainer } from '../../../trainer/models/trainer.interface';

export const selectAuthState = (state: any) => state.auth;

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.currentUser
);

export const selectIsAuthenticated = createSelector(
  selectCurrentUser,
  (user) => !!user
);

export const selectIsTrainer = createSelector(
  selectCurrentUser,
  (user) => user?.role === 'trainer'
);



export const selectIsUser = createSelector(
  selectCurrentUser,
  (user) => user?.role === 'user'
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);



export const selectTrainerStatus = createSelector(
  selectAuthState,
  (state): Trainer | null => {
    if (state.currentUser?.role === 'trainer') {
      return state.currentUser as Trainer;
    }
    return null;
  }
);



