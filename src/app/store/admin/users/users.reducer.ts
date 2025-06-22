import { createReducer, on } from '@ngrx/store';
import * as UsersActions from './users.actions';
import { Trainer } from '../../../features/trainer/models/trainer.interface';
import {
  PaginatedResponse,
  User,
} from '../../../features/admin/services/admin.service';

export interface UsersState {
  users: (User | Trainer)[];
  total: number;
   page: number;
  limit: number;
  loading: boolean;
  totalPages: number;
  loaded: boolean;
  error: any;
}

export const initialState: UsersState = {
  users: [],
  total: 0,
   page: 1,
  limit: 2,
  totalPages: 0,
  loading: false,
  loaded: false,
  error: null,
};

export const usersReducer = createReducer(
  initialState,
  on(UsersActions.loadUsers, (state) => ({ ...state, loading: true })),
  on(UsersActions.loadUsersSuccess, (state, { response }) => ({
    ...state,
    users: response.data,
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
    loading: false,
    loaded: true,
    error: null,
  })),
  on(UsersActions.resetUsersLoaded, (state) => ({
  ...state,
  usersLoaded: false,
})),
  on(UsersActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    loaded: false,
    error,
  })),
  on(UsersActions.toggleBlockAndLoadUsers, (state) => ({
    ...state,
    loading: true,
  })),
  on(UsersActions.toggleBlockAndLoadUsersSuccess, (state, { response }) => ({
    ...state,
    users: response.data,
    total: response.total,
    loading: false,
    loaded: true,
    error: null,
  })),
  on(UsersActions.toggleBlockAndLoadUsersFailure, (state, {error}) => ({
    ...state,
    loading: false,
    error
  }))
);
