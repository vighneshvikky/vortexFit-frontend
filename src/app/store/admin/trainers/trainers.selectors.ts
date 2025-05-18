
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TrainersState } from './trainers.state';

export const selectTrainersState = createFeatureSelector<TrainersState>('trainers');

export const selectUnverifiedTrainers = createSelector(
  selectTrainersState,
  (state) => state.trainers
);

export const selectTrainersLoading = createSelector(
  selectTrainersState,
  (state) => state.loading
);
