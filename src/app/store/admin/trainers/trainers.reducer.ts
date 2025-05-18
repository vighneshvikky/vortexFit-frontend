// store/admin/trainers/trainers.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { Trainer } from '../../../features/trainer/models/trainer.interface';
import * as TrainerActions from './trainers.actions';

export interface TrainersState {
  trainers: Trainer[];
  loading: boolean;
  error: string | null;
}

export const initialState: TrainersState = {
  trainers: [],
  loading: false,
  error: null,
};

export const trainersReducer = createReducer(
  initialState,
  on(TrainerActions.loadUnverifiedTrainers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(TrainerActions.loadUnverifiedTrainersSuccess, (state, { trainers }) => ({
    ...state,
    trainers,
    loading: false,
  })),
  on(TrainerActions.loadUnverifiedTrainersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(TrainerActions.acceptTrainer, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(TrainerActions.acceptTrainerSuccess, (state, { trainer }) => ({
    ...state,
    trainers: state.trainers.map((t) => (t.id === trainer.id ? trainer : t)),
    loading: false,
  })),
  on(TrainerActions.acceptTrainerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(TrainerActions.rejectTrainer, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(TrainerActions.rejectTrainerSuccess, (state, { trainer }) => ({
    ...state,
    trainers: state.trainers.map((t) => (t.id === trainer.id ? trainer : t)),
    loading: false,
  })),
  on(TrainerActions.rejectTrainerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
