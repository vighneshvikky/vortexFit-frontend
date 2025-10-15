import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SignupRequest } from '../interfaces/auth/signup-request.model';
import { ApiResponse } from '../models/api-response.model';
import { SignupResponse } from '../interfaces/auth/signup-response.model';
import { OtpVerificationResponse } from '../interfaces/auth/otp-verification-response.model';
import { OtpVerificationRequest } from '../interfaces/auth/otp-verification-request.model';
import { LoginResponse } from '../interfaces/auth/login-response.model';
import { LoginRequest } from '../interfaces/auth/login-request.model';

import { Trainer } from '../../features/trainer/models/trainer.interface';
import { User } from '../../features/admin/services/admin.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = `${environment.api}/auth`;


  constructor(private http: HttpClient) {}
  private userSubject = new BehaviorSubject<User | Trainer | null>(null);
  public user$ = this.userSubject.asObservable();
  registerUser(data: SignupRequest): Observable<ApiResponse<SignupResponse>> {
    console.log('`${environment.api}/auth`', `${environment.api}/auth`);
    console.log('Testing')
    return this.http
      .post<ApiResponse<SignupResponse>>(`${this.api}/signup`, data)
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  verifyOtp(email: string, otp: string, role: string) {
    return this.http.post<ApiResponse<OtpVerificationResponse>>(
      `${this.api}/verify-otp`,
      { email, otp, role }
    );
  }

  resendOtp(email: string, role: string) {
    return this.http.post<ApiResponse<OtpVerificationRequest>>(
      `${this.api}/resend-otp`,
      { email, role }
    );
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.api}/login`, credentials, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  forgotPassword(email: string, role: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.api}/forgot-password`, {
      email,
      role,
    });
  }

  resetPassword(
    token: string,
    role: string,
    newPassword: string
  ): Observable<ApiResponse<{ role: string }>> {
    console.log('newPassword', newPassword);
    return this.http.post<ApiResponse<{ role: string }>>(
      `${this.api}/reset-password`,
      {
        token,
        role,
        newPassword,
      }
    );
  }

  authenticateWithGoogle(
    idToken: string,
    role: string
  ): Observable<ApiResponse<LoginResponse>> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.api}/google`, { idToken, role })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  refreshToken() {
    console.log('calling refresh token');
    return this.http.post(
      `${this.api}/refresh/token`,
      {},
      { withCredentials: true }
    );
  }

  googleLogin(idToken: string, role: string) {
    return this.http.post<{ user: User | Trainer }>(
      `${this.http}/google-login`,
      {
        idToken,
        role,
      }
    );
  }

  logout() {
    return this.http.post(`${this.api}/logout`, {}, { withCredentials: true });
  }
}
