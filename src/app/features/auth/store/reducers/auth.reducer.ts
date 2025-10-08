import { createReducer, on } from '@ngrx/store';
import * as AuthActions from '../actions/auth.actions';
import { AuthenticatedUser } from '../actions/auth.actions';

export interface AuthState {
  currentUser: AuthenticatedUser | null;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  currentUser: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    currentUser: user,
    loading: false,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(AuthActions.logout, (state) => ({
    ...state,
    currentUser: null,
  })),
  on(AuthActions.updateCurrentUserVerificationStatus, (state, { status }) => ({
    ...state,
    currentUser: state.currentUser
      ? { ...state.currentUser, verificationStatus: status }
      : null,
  })),
  on(AuthActions.updateCurrentUserRejectionReason, (state, { reason }) => ({
    ...state,
    currentUser: state.currentUser
      ? { ...state.currentUser, rejectionReason: reason }
      : null,
  })),

  on(AuthActions.setUser, (state, { user }) => ({
    ...state,
    currentUser: user,
    loading: false,
    error: null,
  })),
on(AuthActions.updateCurrentUser, (state, { user }) => ({
  ...state,
  currentUser: {
    ...state.currentUser,
    ...user,
  },
}))
);
