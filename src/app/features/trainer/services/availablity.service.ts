import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviorments/environment';
// Simplified availability payload for creating or updating
export interface Availability {
  date: string;
  slots: {
    start: string;
    end: string;
    isDefault?: boolean;
    isActive?: boolean;
  }[];
}


export interface TimeSlot {
  _id?: string;  
  start: string;
  end: string;
  isDefault?: boolean;
  isActive?: boolean;
}


export interface AvailabilityResponse {
  _id: string;
  date: string;
  trainerId: string;
  slots: TimeSlot[];
}



@Injectable({
    providedIn: 'root'
})

export class AvailablityService {
    private apiUrl = `${environment.api}/availability`
    private http = inject(HttpClient);


setAvailability(payload: any) {
  console.log('🟡 Original payload:', payload); 
  console.log('hai')
  // const formattedPayload = {
  //   date: payload.date || null,
  //   slots: Array.isArray(payload.slots) ? payload.slots.map((slot: string) => {
  //     const [start, end] = slot.split('-');
  //     return { start, end };
  //   }) : [],
  // };

  // console.log('formatted payloaded', formattedPayload)
  // return this.http.post<any>(`${this.apiUrl}/set-availability`, payload);
}



  getDefaultSlots(): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/default-slots`)
  }



  getMyAvailability(date: string ): Observable<Availability> {
    const params = new HttpParams().set('date', date);
    return this.http.get<Availability>(`${this.apiUrl}/get-availability-trainer`, { params });
  }


  getTrainerAvailability(trainerId: string, date: string): Observable<Availability> {
    const params = new HttpParams()
      .set('trainerId', trainerId)
      .set('date', date);
    return this.http.get<Availability>(`${this.apiUrl}/by-trainer`, { params });
  }

 
  deleteAvailability(date: string): Observable<any> {
    const params = new HttpParams().set('date', date);
    return this.http.delete(`${this.apiUrl}`, { params });
  }

}