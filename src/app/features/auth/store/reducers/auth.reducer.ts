import { createReducer, on } from '@ngrx/store';
import { login, loginSuccess, loginFailure } from '../actions/auth.actions';
import { AuthState } from '../auth.state';

export const initialState: AuthState = {
  currentUser: null,
  isLoggedIn: false,
  loading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,
  on(login, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(loginSuccess, (state, { user }) => ({
    ...state,
    currentUser: user,
    isLoggedIn: true,
    loading: false
  })),
  on(loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
