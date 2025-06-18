import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviorments/environment';
export interface Availability {
  date: string;        // 'YYYY-MM-DD'
  slots: string[];     // ['07:00', '08:00']
}



@Injectable({
    providedIn: 'root'
})

export class AvailablityService {
    private apiUrl = `${environment.api}/availability`
    private http = inject(HttpClient);

      setAvailability(payload: { date: string; slots: string[] }): Observable<any> {
    return this.http.post(`${this.apiUrl}/set-availability`, payload);
  }

  getMyAvailability(date: string): Observable<Availability> {
    const params = new HttpParams().set('date', date);
    return this.http.get<Availability>(`${this.apiUrl}/get-availability-trainer`, { params });
  }


  getTrainerAvailability(trainerId: string, date: string): Observable<Availability> {
    const params = new HttpParams()
      .set('trainerId', trainerId)
      .set('date', date);
    return this.http.get<Availability>(`${this.apiUrl}/by-trainer`, { params });
  }

  // Optional: delete all slots for a given date
  deleteAvailability(date: string): Observable<any> {
    const params = new HttpParams().set('date', date);
    return this.http.delete(`${this.apiUrl}`, { params });
  }

}