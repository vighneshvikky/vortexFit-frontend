import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';



interface DashboardStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  hasActiveSubscription: boolean;
  subscriptionName: string | null;
  walletBalance: number;
  totalSpent: number;
}

interface SpendingSummary {
  bookingSpent: number;
  subscriptionSpent: number;
  totalSpent: number;
}

interface Booking {
  _id: string;
  date: string;
  timeSlot: string;
  status: string;
  amount: number;
  trainerId: { name: string; email: string };
}

interface Transaction {
  _id: string;
  amount: number;
  sourceType: string;
  createdAt: Date;
  toUser: { name: string; email: string };
}

interface WalletBalance {
  balance: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserDashboardService {
  private apiUrl = `${environment.api}/user-dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getSpendingSummary(): Observable<SpendingSummary> {
    return this.http.get<SpendingSummary>(`${this.apiUrl}/spending-summary`);
  }

  getRecentBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings`);
  }

  getRecentTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`);
  }

  getWalletBalance(): Observable<WalletBalance> {
    return this.http.get<WalletBalance>(`${this.apiUrl}/wallet`);
  }
}