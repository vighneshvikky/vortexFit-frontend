import { Injectable } from '@angular/core';
import { environment } from '../../../../enviorments/environment';
import { API_ROUTES } from '../../../app.routes.constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingSession } from '../pages/trainer-session/interface/trainer.session.interface';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = environment.api + API_ROUTES.BOOKING.BASE;
  constructor(private http: HttpClient) {}

  getBooking(): Observable<BookingSession[]> {
    return this.http.get<BookingSession[]>(
      `${this.apiUrl}${API_ROUTES.BOOKING.GET_BOOKINGS}`
    );
  }

    updateBookingStatus(bookingId: string, bookingStatus: string ): Observable<BookingSession>{
        return this.http.patch<BookingSession>(`${this.apiUrl}${API_ROUTES.BOOKING.CHANGE_STATUS}`, {bookingId, bookingStatus})
    }
}
