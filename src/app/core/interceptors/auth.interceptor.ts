import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Observable,
  catchError,
  switchMap,
  throwError,
  BehaviorSubject,
  filter,
  take,
} from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<boolean>(false);
  private authService = inject(AuthService);
  private router = inject(Router);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const excludedUrls = ['/auth', '/login', '/signup', '/otp']; 


     if (excludedUrls.some((url) => req.url.includes(url))) {
    return next.handle(req); // Don't attach credentials or refresh token logic
  }
    console.log('AuthInterceptor intercepted:', req.url);
    const clonedRequest = req.clone({
      withCredentials: true,
    });
    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(clonedRequest, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('handling 401 erro');
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
          console.error('Token refresh failed', err);
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
