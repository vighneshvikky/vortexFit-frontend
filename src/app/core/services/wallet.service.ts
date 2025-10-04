import { Injectable } from '@angular/core';
import { environment } from '../../../enviorments/environment';
import { API_ROUTES } from '../../app.routes.constants';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingData } from '../../features/user/pages/user-confirm-booking/user-confirm-booking.component';
import { TimeSlot } from '../../features/user/pages/user-booking/interface/user-booking.interface';
import { WalletResponse } from '../../features/user/pages/user-booking/user-booking.component';

export interface Wallet {
  _id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private api = environment.api + API_ROUTES.WALLET.BASE;

  constructor(private http: HttpClient) {}

  addFailedPayment(data: {
    orderId: string;
    paymentId: string;
    amount: number;
    reason: string;
  }): Observable<WalletResponse> {
    return this.http.post<WalletResponse>(
      `${this.api}${API_ROUTES.WALLET.FAILED_PAYMENT}`,
      data
    );
  }

  getBalance(): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.api}${API_ROUTES.WALLET.BALANCE}`);
  }

  payWithWallet(data: {
    trainerId: string;
    amount: number;
    sessionType: string;
    date: string;
    timeSlot: TimeSlot | null;
  }) {
    return this.http.post<{
      success: boolean;
      bookingId: string;
      balance: number;
    }>(`${this.api}${API_ROUTES.WALLET.PAY}`, data);
  }
}
