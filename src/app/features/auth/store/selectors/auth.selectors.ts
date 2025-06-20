  import { createSelector } from '@ngrx/store';
  import { AuthState } from '../reducers/auth.reducer';

  
  export const selectAuthState = (state: any) => state.auth;

  export const selectCurrentUser = createSelector(
    selectAuthState,
    (state: AuthState) => state.currentUser
  );

  export const selectAuthLoading = createSelector(
    selectAuthState,
    (state: AuthState) => state.loading
  );

  export const selectAuthError = createSelector(
    selectAuthState,
    (state: AuthState) => state.error
  );


  export const selectCurrentUserVerificationStatus = createSelector(
    selectCurrentUser,
    (currentUser) => currentUser?.verificationStatus
  );









