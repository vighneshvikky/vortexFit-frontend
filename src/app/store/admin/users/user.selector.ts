import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UsersState } from './users.reducer';
import { Trainer } from '../../../features/trainer/models/trainer.interface';

export const selectUsersFeature = createFeatureSelector<UsersState>('users');

export const selectUsersList = createSelector(
  selectUsersFeature,
  (state) => state.users
);

export const selectUsersTotal = createSelector(
  selectUsersFeature,
  (state) => state.total
);

export const selectUsersLoading = createSelector(
  selectUsersFeature,
  (state) => state.loading
);

export const selectUsersError = createSelector(
  selectUsersFeature,
  (state) => state.error
);
export const selectUsersLoaded = createSelector(
  selectUsersFeature,
  (state) => state.loaded
);


export const selectUnverifiedTrainers = createSelector(
  selectUsersFeature,
  (state) => state.users.filter(
    (user): user is Trainer =>
      user.role === 'trainer' && user.isVerified === false
  )
);

