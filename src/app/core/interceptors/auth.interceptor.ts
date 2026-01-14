import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { Injectable, NgZone, inject } from '@angular/core';
import {
  Observable,
  catchError,
  switchMap,
  throwError,
  BehaviorSubject,
  filter,
  take,
  EMPTY,
} from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NotyService } from '../services/noty.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<boolean>(false);
  private authService = inject(AuthService);
  private router = inject(Router);
  private zone = inject(NgZone);
  private notify = inject(NotyService);

  intercept<T>(
    req: HttpRequest<T>,
    next: HttpHandler
  ): Observable<HttpEvent<T>> {
    const excludedUrls = [
      '/auth/login',
      '/auth/signup',
      '/auth/otp',
      '/auth/refresh',
    ];

    if (excludedUrls.some((url) => req.url.includes(url))) {
      return next.handle(req);
    }

    const clonedRequest = req.clone({
      withCredentials: true,
    });
    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {


        if (error.status === HttpStatusCode.BadRequest) {
          this.notify.showError(error.error?.message || 'Bad request');
          return throwError(() => error);
        }

        if (error.status === HttpStatusCode.Unauthorized) {
  
          return this.handle401Error(clonedRequest, next);
        }
        if (error.status === HttpStatusCode.Conflict) {
          this.notify.showError(error.error?.message || 'Conflict error');
          return throwError(() => error);
        }
        if (error.status === HttpStatusCode.InternalServerError) {
          this.notify.showError(
            error.error?.message || 'Internal server error'
          );
          return throwError(() => error);
        }
        if (
          error.status === HttpStatusCode.Forbidden &&
          (error.error?.message === 'User is blocked or not found' ||
            error.error?.message === 'Trainer is blocked or not found')
        ) {
          this.zone.run(() => {
            this.router.navigate(['/blocked']).then((success) => {
              console.log('Navigation success:', success);
            });
          });
        }

        return EMPTY;
      })
    );
  }

  private handle401Error<T>(
    req: HttpRequest<T>,
    next: HttpHandler
  ): Observable<HttpEvent<T>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(false);

      return this.authService.refreshToken().pipe(
        switchMap(() => {
          this.refreshTokenSubject.next(true);
          this.isRefreshing = false;
          return next.handle(req);
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.router.navigate(['/admin/login']);
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((refreshed) => refreshed),
        take(1),
        switchMap(() => next.handle(req))
      );
    }
  }
}
