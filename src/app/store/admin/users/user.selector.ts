import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UsersState } from './users.reducer';
import { Trainer } from '../../../features/trainer/models/trainer.interface';

export const selectUsersFeature = createFeatureSelector<UsersState>('users');

export const selectUsersList = createSelector(
  selectUsersFeature,
  (state) => state.users
);

export const selectUsersMeta = createSelector(
  selectUsersFeature,
  (state) => ({
    total: Number(state.total),
    totalPages: Number(state.totalPages),
    page: Number(state.page),   
    limit: Number(state.limit)
  })
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

