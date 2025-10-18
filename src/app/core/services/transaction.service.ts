import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { API_ROUTES } from '../../app.routes.constants';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { transactionsData } from '../transactions/transactions.component';

export interface Transaction {
  _id: string;
  fromUser: {
    _id: string;
    name: string;
    email: string;
  };
  toUser: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  sourceType: 'BOOKING' | 'SUBSCRIPTION';
  sourceId?: string;
  currency: string;
  paymentId: string;
  orderId: string;
  paymentSignature?: string;
  createdAt: string;
  updatedAt: string;
  bookingMethod: string;
  isCancelled: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private api = environment.api + API_ROUTES.TRANSACTIONS.BASE;

  constructor(private http: HttpClient) {}

  getUserTransactions(filters?: any): Observable<transactionsData> {
    console.log('fitler', filters)
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this.http.get<transactionsData>(`${this.api}/user`, { params });
  }

  getEarnings() {
    return this.http.get(
      `${this.api}/earnings`
    );
  }

  getExpenses(): Observable<{ total: number; transactions: Transaction[] }> {
    return this.http.get<{ total: number; transactions: Transaction[] }>(
      `${this.api}/expenses`
    );
  }
  getAllTransactions(filters?: any): Observable<transactionsData> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<transactionsData>(`${this.api}/user`, { params });
  }
}
