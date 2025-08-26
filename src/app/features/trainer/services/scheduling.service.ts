import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  SchedulingRule,
  TimeSlot,
  DaySlots,
  SchedulingFormData,
} from '../models/scheduling.interface';
import { environment } from '../../../../enviorments/environment';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '../../../app.routes.constants';

@Injectable({
  providedIn: 'root',
})
export class SchedulingService {
  private apiUrl = `${environment.api}/schedules`;



  constructor(private http: HttpClient) {}

  public addSlotRule(rule: SchedulingRule): Observable<SchedulingRule> {
    return this.http.post<SchedulingRule>(
      `${this.apiUrl}${API_ROUTES.SCHEDULES.CREATE}`,
      rule
    );
  }

  getSchedule(): Observable<SchedulingRule[]> {
    return this.http.get<SchedulingRule[]>(
      `${this.apiUrl}${API_ROUTES.SCHEDULES.GET_SCHEDULES}`
    );
  }

  deleteSchedule(id: string): Observable<SchedulingRule> {
    return this.http.delete<SchedulingRule>(
      `${this.apiUrl}${API_ROUTES.SCHEDULES.DELETE_SCHEDULES(id)}`
    );
  }







}
