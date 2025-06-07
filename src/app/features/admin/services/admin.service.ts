import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviorments/environment';
import { GetUsersQuery } from '../../../shared/components/admin/sidebar/sidebar.component';
import { Trainer } from '../../trainer/models/trainer.interface';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  id: string;
  email: string;
  name: string;
}

export interface User {

  _id: string; 
  name: string;
  email: string;
  role: 'user' 
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

  constructor(private http: HttpClient) {}

  login(credentials: AdminLoginRequest): Observable<AdminLoginResponse> {
    return this.http.post<AdminLoginResponse>(
      `${this.apiUrl}/login`,
      credentials
    );
  }

  getUsers(params: GetUsersParams): Observable<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}/users`, {
      params: params as any,
    });
  }

  toggleBlockStatusAndFetchUsers(
    userId: string,
    role: string,
    params: GetUsersParams
  ) {
    const { page = 1, limit = 10, search = '' } = params;
    return this.http.patch<PaginatedResponse<User | Trainer>>(
      `${this.apiUrl}/users/${userId}/toggle-block`,
      null,
      {
        params: {
          role,
          page: page.toString(),
          limit: limit.toString(),
          search,
        },
      }
    );
  }

  getUnverifiedTrainers(
    query: GetUsersQuery
  ): Observable<PaginatedResponse<Trainer>> {
    return this.http.get<PaginatedResponse<Trainer>>(
      `${this.apiUrl}/listTrainers`,
      {
        params: query as any,
      }
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
}
