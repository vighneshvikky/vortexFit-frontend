import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { environment } from '../../../../environments/environment';
import { environment } from '../../../../enviorments/environment';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  id: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'trainer';
  createdAt: string;
  isBlocked: boolean;
  password?: string;
}

export interface GetUsersParams {
  search?: string;
  role?: 'user' | 'trainer';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.api}`;

  constructor(private http: HttpClient) {}

  login(credentials: AdminLoginRequest): Observable<AdminLoginResponse> {
    return this.http.post<AdminLoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  getUsers(params: GetUsersParams): Observable<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}/users`, { params: params as any });
  }

  toggleBlockStatus(userId: string, role: 'user' | 'trainer'): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}/toggle-block`, null, {
      params: { role }
    });
  }
} 