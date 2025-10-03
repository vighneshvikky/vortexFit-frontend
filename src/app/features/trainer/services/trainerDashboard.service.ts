import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviorments/environment';

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeSubscriptions: number;
  pendingBookings: number;
}

export interface RevenueBreakdown {
  type: string;
  total: number;
  count: number;
}

export interface BookingStatusBreakdown {
  status: string;
  count: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface RecentBooking {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  date: string;
  timeSlot: string;
  status: string;
  amount: number;
  sessionType?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class TrainerDashboardService {
  private readonly apiUrl = `${environment.api}/trainer/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getRevenueData(): Observable<RevenueBreakdown[]> {
    return this.http.get<RevenueBreakdown[]>(`${this.apiUrl}/revenue`);
  }

  getRecentBookings(): Observable<RecentBooking[]> {
    return this.http.get<RecentBooking[]>(`${this.apiUrl}/bookings/recent`);
  }

  getBookingStatusBreakdown(): Observable<BookingStatusBreakdown[]> {
    return this.http.get<BookingStatusBreakdown[]>(
      `${this.apiUrl}/bookings/status-breakdown`
    );
  }

  getMonthlyRevenue(): Observable<MonthlyRevenue[]> {
    return this.http.get<MonthlyRevenue[]>(`${this.apiUrl}/revenue/monthly`);
  }
}
