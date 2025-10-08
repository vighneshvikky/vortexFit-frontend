// admin-dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviorments/environment';
import { API_ROUTES } from '../../../app.routes.constants';


export interface DashboardStats {
  users: { total: number; newThisMonth: number };
  trainers: { total: number };
  bookings: { total: number };
  subscriptions: { total: number };
  revenue: { total: number; monthly: number };
}

export interface RevenueAnalytics {
  bySource: Array<{ source: string; total: number; count: number }>;
  monthlyTrend: Array<{ month: string; total: number; count: number }>;
  byPlan: Array<{ planName: string; total: number; count: number }>;
}

export interface BookingAnalytics {
  byStatus: Array<{ status: string; count: number }>;
  topTrainers: Array<{
    trainerId: string;
    trainerName: string;
    trainerEmail: string;
    bookingCount: number;
    totalRevenue: number;
  }>;
 
}

export interface SubscriptionAnalytics {
  byPlan: Array<{ planName: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  activeVsExpired: Array<{ status: string; count: number }>;
}

export interface UserAnalytics {
  total: number;
  newThisMonth: number;
  byFitnessGoals: Array<{ goal: string; count: number }>;
  byFitnessLevel: Array<{ level: string; count: number }>;
}

export interface TopTrainer {
  trainerId: string;
  trainerName: string;
  trainerEmail: string;
  bookingCount: number;
  totalRevenue: number;
}

export interface Transaction {
  _id: string;
  amount: number;
  sourceType: string;
  fromUser: { name: string; email: string };
  toUser: { name: string; email: string };
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private apiUrl = environment.api + API_ROUTES.ADMIN_DASHBOARD.BASE

  constructor(private http: HttpClient) {}


  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
  }

  // Revenue Analytics
  getRevenueAnalytics(): Observable<RevenueAnalytics> {
    return this.http.get<RevenueAnalytics>(`${this.apiUrl}/revenue`);
  }

  getTotalRevenue(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.apiUrl}/revenue/total`);
  }

  getMonthlyRevenue(): Observable<{ monthly: number }> {
    return this.http.get<{ monthly: number }>(`${this.apiUrl}/revenue/monthly`);
  }


  getBookingAnalytics(): Observable<BookingAnalytics> {
    return this.http.get<BookingAnalytics>(`${this.apiUrl}/bookings/analytics`);
  }



  getBookingCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/bookings/count`);
  }

 
  getTopTrainers(limit: number = 10): Observable<TopTrainer[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<TopTrainer[]>(`${this.apiUrl}/trainers/top`, { params });
  }

  getTrainerCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/trainers/count`);
  }

  // Subscription Analytics
  getSubscriptionAnalytics(): Observable<SubscriptionAnalytics> {
    return this.http.get<SubscriptionAnalytics>(`${this.apiUrl}/subscriptions/analytics`);
  }

  getSubscriptionCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/subscriptions/count`);
  }

  // User Analytics
  getUserAnalytics(): Observable<UserAnalytics> {
    return this.http.get<UserAnalytics>(`${this.apiUrl}/users/analytics`);
  }

  getUserCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/users/count`);
  }

  // Transaction History
  getRecentTransactions(limit: number = 20): Observable<Transaction[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions/recent`, { params });
  }
}