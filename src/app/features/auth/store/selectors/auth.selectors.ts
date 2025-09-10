  import { createSelector } from '@ngrx/store';
  import { AuthState } from '../reducers/auth.reducer';
import { AppState } from '../../../../store/app.state';

  
  export const selectAuthState = (state: AppState) => state.auth;

  export const selectCurrentUser = createSelector(
    selectAuthState,
    (state: AuthState) => state.currentUser
  );

  
export const selectCurrentUserId = createSelector(
  selectCurrentUser,
  (currentUser) => currentUser?._id   
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









