import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviorments/environment';
import { GetUsersQuery } from '../../../shared/components/admin/sidebar/sidebar.component';
import { Trainer } from '../../trainer/models/trainer.interface';
import { API_ROUTES } from '../../../app.routes.constants';
import { Admin } from '../models/admin.interface';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
data: Admin
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user';
  isBlocked: boolean;
  isVerified: boolean;
  googleId?: string;
  image: string;
  dob: string;
  height: string;
  heightUnit: string;
  weight: string;
  weightUnit: string;
  fitnessLevel: string;
  fitnessGoals: string[];
  trainingTypes: string[];
  preferredTime: string;
  equipments: string[];
  verificationStatus: string;
}

export interface GetUsersParams {
  search?: string;
  role?: 'user' | 'trainer';
  page?: number;
  limit?: number;
  filter?: 'user' | 'trainer' | 'all' | 'blocked';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${environment.api}/admin`;
  private uploadUrl = `${environment.api}`;

  constructor(private http: HttpClient) {}

  login(credentials: AdminLoginRequest): Observable<AdminLoginResponse> {
    return this.http.post<AdminLoginResponse>(
      `${this.apiUrl}/login`,
      credentials,
      { withCredentials: true }
    );
  }

  getUsers(
    params: GetUsersParams
  ): Observable<PaginatedResponse<User | Trainer>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    return this.http.get<PaginatedResponse<User | Trainer>>(
      `${this.apiUrl}/users`,
      {
        params: httpParams,
      }
    );
  }

  toggleBlockStatus(userId: string, role: string): Observable<User | Trainer> {
    return this.http.patch<User | Trainer>(
      `${this.apiUrl}/users/${userId}/toggle-block`,
      null,
      { params: { role } }
    );
  }

  getUnverifiedTrainers(
    query: GetUsersQuery
  ): Observable<PaginatedResponse<Trainer>> {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<PaginatedResponse<Trainer>>(
      `${this.apiUrl}/listTrainers`,
      {
        params,
      }
    );
  }

  approveTrainer(trainerId: string): Observable<Trainer> {
    return this.http.patch<Trainer>(
      `${this.apiUrl}/verify-trainer/${trainerId}`,
      {}
    );
  }

  getTrainers(): Observable<Trainer[]> {
    return this.http.get<Trainer[]>(`${this.apiUrl}/trainers`);
  }

  acceptTrainer(trainerId: string): Observable<Trainer> {
    return this.http.patch<Trainer>(
      `${this.apiUrl}/verify-trainer/${trainerId}`,
      {}
    );
  }

  rejectTrainer(trainerId: string, reason: string): Observable<Trainer> {
    console.log('trainerid', trainerId);
    return this.http.patch<Trainer>(
      `${this.apiUrl}/reject-trainer/${trainerId}`,
      { reason }
    );
  }

  download(key: string, fileName: string) {
    console.log('downloading', key, fileName)
    return this.http.post<{ url: string }>(
      `${this.uploadUrl}${API_ROUTES.S3.BASE}${API_ROUTES.S3.GENERATE_DOWNLOAD_URL}`,
      { key, fileName }
    );
  }
}
