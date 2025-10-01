import { Injectable } from '@angular/core';
import { environment } from '../../../enviorments/environment';
import { API_ROUTES } from '../../app.routes.constants';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingData } from '../../features/user/pages/user-confirm-booking/user-confirm-booking.component';
import { TimeSlot } from '../../features/user/pages/user-booking/interface/user-booking.interface';


export interface Wallet {
  _id: string;           // MongoDB ObjectId as string
  userId: string;        // User's ObjectId
  balance: number;       // Available balance
  createdAt: string;     // ISO date string
  updatedAt: string;     // ISO date string
}


@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private api = environment.api + API_ROUTES.WALLET.BASE;

  constructor(private http: HttpClient) {}

 addFailedPayment(data: { orderId: string; paymentId: string; amount: number; reason: string }) {
    return this.http.post(`${this.api}${API_ROUTES.WALLET.FAILED_PAYMENT}`, data);
  }

  getBalance(): Observable<Wallet>{
    return this.http.get<Wallet>(`${this.api}${API_ROUTES.WALLET.BALANCE}`)
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
      balance: number 
    }>(`${this.api}${API_ROUTES.WALLET.PAY}`, data);
  }
}
