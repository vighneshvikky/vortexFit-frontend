import { Injectable } from '@angular/core';

import { API_ROUTES } from '../../../app.routes.constants';
import { HttpClient } from '@angular/common/http';
import {  Observable} from 'rxjs';
import {
  BookingSession,
  
} from '../pages/trainer-session/interface/trainer.session.interface';
import { environment } from '../../../../environments/environment';
export interface BookingFilters {
  clientId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
}

export interface CancellationResponse {
  message: string;
  bookingData: BookingSession
}

export interface BookingResponse {
  bookings: BookingSession[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}
@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = environment.api + API_ROUTES.BOOKING.BASE;
  constructor(private http: HttpClient) {}

  getBooking(
    page: number = 1,
    limit: number = 5
  ): Observable<BookingResponse> {
    const params = {
      page: String(page),
      limit: String(limit),
    };

    return this.http.get<BookingResponse>(
      `${this.apiUrl}${API_ROUTES.BOOKING.GET_BOOKINGS}`,
      { params }
    );
  }

  getUserBooking(
    page: number = 1,
    limit: number = 5
  ): Observable<BookingResponse> {
    const params = {
      page: String(page),
      limit: String(limit),
    };
    return this.http.get<BookingResponse>(
      `${this.apiUrl}${API_ROUTES.BOOKING.GET_USER_BOOKINGS}`,
      { params }
    );
  }

  updateBookingStatus(
    bookingId: string,
    bookingStatus: string
  ): Observable<BookingSession> {
    return this.http.patch<BookingSession>(
      `${this.apiUrl}${API_ROUTES.BOOKING.CHANGE_STATUS}`,
      { bookingId, bookingStatus }
    );
  }

  getFilteredBookings(
    filters: BookingFilters,
    page: number = 1,
    limit: number = 5
  ): Observable<BookingResponse> {
    const params: Record<string, string> = {
      ...Object.keys(filters).reduce((acc, key) => {
        const value = filters[key as keyof BookingFilters];
        if (value !== undefined && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>),
      page: String(page),
      limit: String(limit),
    };

    return this.http.get<BookingResponse>(
      `${this.apiUrl}${API_ROUTES.BOOKING.GET_BOOKINGS_BY_FILTER}`,
      { params }
    );
  }

  getUserFilteredBookings(
    filters: BookingFilters,
    page: number = 1,
    limit: number = 5
  ): Observable<BookingResponse> {
    const params: Record<string, string> = {
      ...Object.keys(filters).reduce((acc, key) => {
        const value = filters[key as keyof BookingFilters];
        if (value !== undefined && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>),
      page: String(page),
      limit: String(limit),
    };

    return this.http.get<BookingResponse>(
      `${this.apiUrl}${API_ROUTES.BOOKING.GET_USER_BOOKINGS_BY_FILTER}`,
      { params }
    );
  }

  cancelBooking(bookingId: string): Observable<CancellationResponse> {
    console.log('bookingId', bookingId)
    return this.http.patch<CancellationResponse>(
      `${this.apiUrl}${API_ROUTES.BOOKING.CANCEL_BOOKING(bookingId)}`,
      {}
    );
  }
}
