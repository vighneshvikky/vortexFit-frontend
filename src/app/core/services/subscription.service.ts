import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { API_ROUTES } from '../../app.routes.constants';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  constructor(private http: HttpClient) {}
  private api = environment.api + API_ROUTES.SUBSCRIPTION.BASE;
  private paymentApi = environment.api + API_ROUTES.PAYMENT.BASE;
  createOrder(planId: string, userId: string) {
    return this.http.post<any>(
      `${this.paymentApi}${API_ROUTES.PAYMENT.CREATE_SUBSCRIPTION_PAYMENT}`,
      {
        planId,
        userId,
      }
    );
  }

  verifyOrder(response: any) {
    console.log('response for verify order', response);
    return this.http.post<{ status: 'success' | 'failure'; bookingId: string }>(
      `${this.paymentApi}${API_ROUTES.PAYMENT.VERIFY_SUBSCRIPTION_PAYMENT}`,
      response
    );
  }
}
