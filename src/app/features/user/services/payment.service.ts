import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { API_ROUTES } from '../../../app.routes.constants';
import { PaymentSuccessResponse, SessionBookingRequest } from '../pages/user-booking/interface/user-booking.interface';
import { BookingSession } from '../../trainer/pages/trainer-session/interface/trainer.session.interface';
import { environment } from '../../../../environments/environment';

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
    createOrder(response: SessionBookingRequest) {
    console.log('response for creating a order', response)
    return this.http.post<CreateOrderResponse>(
      `${this.api}${API_ROUTES.PAYMENT.CREATE_ORDER}`,
      response
    );
  }

  verifyOrder(response: PaymentSuccessResponse) {
    console.log('response for verify order', response) 
    return this.http.post<{ status: 'success' | 'failure', bookingId: string }>(
      `${this.api}${API_ROUTES.PAYMENT.VERIFY_PAYMENT}`,
      response
    );
  }

  lockSlot(data: SessionBookingRequest) {
  return this.http.post<{ booking: BookingSession }>(
    `${this.api}${API_ROUTES.PAYMENT.LOCK_SLOT}`,
    data
  );
}


  

}
