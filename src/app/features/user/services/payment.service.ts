import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../enviorments/environment';
import { API_ROUTES } from '../../../app.routes.constants';

export interface CreateOrderResponse {
  order: {
    id: string;
    amount: number;
    currency: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private http: HttpClient) {}
  private api = environment.api + API_ROUTES.PAYMENT.BASE;
  createOrder(response: any) {
    return this.http.post<CreateOrderResponse>(
      `${this.api}${API_ROUTES.PAYMENT.CREATE_ORDER}`,
      response
    );
  }

  verifyOrder(response: any) {
    return this.http.post<{ status: 'success' | 'failure' }>(
      `${this.api}${API_ROUTES.PAYMENT.VERIFY_PAYMENT}`,
      response
    );
  }
}
