import { Injectable } from '@angular/core';
import { environment } from '../../../enviorments/environment';
import { API_ROUTES } from '../../app.routes.constants';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transaction {
  _id: string;
  fromUser: string;
  toUser: string;
  amount: number;
  sourceType: 'BOOKING' | 'SUBSCRIPTION';
  sourceId?: string;
  currency: string;
  paymentId: string;
  orderId: string;
  paymentSignature?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private api = environment.api + API_ROUTES.TRANSACTIONS.BASE;

  constructor(private http: HttpClient) {}

  getUserTransactions(filters?: any): Observable<Transaction[]> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this.http.get<Transaction[]>(`${this.api}/user`, { params });
  }

  getEarnings(): Observable<{ total: number; transactions: Transaction[] }> {
    return this.http.get<{ total: number; transactions: Transaction[] }>(
      `${this.api}/earnings`
    );
  }

  getExpenses(): Observable<{ total: number; transactions: Transaction[] }> {
    return this.http.get<{ total: number; transactions: Transaction[] }>(
      `${this.api}/expenses`
    );
  }
  getAllTransactions(filters?: any): Observable<Transaction[]> {
    let params = new HttpParams();  
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<Transaction[]>(`${this.api}`, { params });
  }
}
