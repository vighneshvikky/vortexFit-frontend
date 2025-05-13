import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AuthState } from '../auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCurrentUser = createSelector(
  selectAuthState,
  state => state.currentUser
);

export const selectIsTrainer = createSelector(
  selectCurrentUser,
  user => user?.role === 'trainer'
);

export const selectIsUser = createSelector(
  selectCurrentUser,
  user => user?.role === 'user'
);

export const selectAuthError = createSelector(
  selectAuthState,
  state => state.error
);

export const selectIsLoading = createSelector(
  selectAuthState,
  state => state.loading
);
