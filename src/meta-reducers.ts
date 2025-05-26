import { localStorageSync } from 'ngrx-store-localstorage';
import { MetaReducer } from '@ngrx/store';
import { AppState } from './app/store/app.state';
import { ActionReducer } from '@ngrx/store';

export function localStorageSyncReducer(
  reducer: ActionReducer<AppState>
): ActionReducer<AppState> {
 return localStorageSync({
  keys: [
    {
      auth: {
        serialize: (authState) => {
          const {currentUser, ...rest} = authState;

          if(!currentUser) return {...rest, currentUser: null};

          const {
            password,
            provider,
            certificationUrl,
            idProofUrl,
            ...safeUser
          } = currentUser;

          return {
            ...rest,
            currentUser: safeUser,
          };
        },
        deserialize: (storedState) => ({
          ...storedState
        }),
      },
    },
  ],
  rehydrate: true
 })(reducer)
}

export const metaReducers: MetaReducer[] = [localStorageSyncReducer];
