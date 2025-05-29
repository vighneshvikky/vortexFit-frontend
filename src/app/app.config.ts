  import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
  import { provideRouter } from '@angular/router';
  import { provideAnimations } from '@angular/platform-browser/animations';
  import { routes } from './app.routes';
  import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
  import { provideStore } from '@ngrx/store';
  import { authReducer } from './features/auth/store/reducers/auth.reducer';
  import { provideEffects } from '@ngrx/effects';
  import { AuthEffects } from './features/auth/store/effects/auth.effects';
  import { AuthInterceptor } from './core/interceptors/auth.interceptor';
  import { usersReducer } from './store/admin/users/users.reducer';
  import { UsersEffects } from './store/admin/users/users.effects';
  import { metaReducers } from '../meta-reducers';
import { initializeApp } from './core/init/app.initializer';



  export const appConfig: ApplicationConfig = {
    
    providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      provideHttpClient(withInterceptorsFromDi()),
      provideStore(
        {
        auth: authReducer,
        users: usersReducer,
      },
      {
        metaReducers,
      }
    ),

      provideEffects([AuthEffects, UsersEffects]),
      provideAnimations(),
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true,
      },
    ],

  };
