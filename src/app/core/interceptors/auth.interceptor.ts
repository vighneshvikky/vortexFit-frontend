import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Update path as needed

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<boolean>(false);
  private authService = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(false);

      return this.authService.refreshToken().pipe(
        switchMap(() => {
          this.refreshTokenSubject.next(true);
          this.isRefreshing = false;
          // Clone and retry the original request
          return next.handle(req);
        }),
        catchError(err => {
          this.isRefreshing = false;
          return throwError(() => err);
        })
      );
    } else {
      // If refresh is already in progress, wait for it to complete
      return this.refreshTokenSubject.pipe(
        filter(refreshed => refreshed),
        take(1),
        switchMap(() => next.handle(req))
      );
    }
  }
}
