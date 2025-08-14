import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviorments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Trainer } from '../../trainer/models/trainer.interface';
import { User } from '../../admin/services/admin.service';
import { SchedulingRule } from '../../trainer/models/scheduling.interface';
import { API_ROUTES } from '../../../app.routes.constants';
@Injectable({
  providedIn: 'root',
})
export class UserService {

  private apiUrl = environment.api + API_ROUTES.USER.BASE;
  private scheduleUrl = environment.api + API_ROUTES.SCHEDULES.BASE

  constructor(private http: HttpClient) {}

  updateProfile(data: Partial<User>): Observable<User> {

    return this.http.patch<User>(`${this.apiUrl}${API_ROUTES.USER.UPDATE_PROFILE}`, data)
  }

  getTrainer(category?: string): Observable<Trainer[]> {
    return this.http.get<Trainer[]>(`${this.apiUrl}${API_ROUTES.USER.APPROVED_TRAINER}`, {
      params: {
        category: category || '',
      },
    });
  }

  generateSlots(trainerId: string): Observable<SchedulingRule[]> {
   
       return this.http.get<SchedulingRule[]>(
      `${this.scheduleUrl}${API_ROUTES.SCHEDULES.GENERATE_SLOTS(trainerId)}`
    );
  }

  getTrainerData(id: string): Observable<Trainer> {
    return this.http.get<Trainer>(`${this.apiUrl}${API_ROUTES.USER.GET_TRAINER_DATA(id)}`)
  }


    getSignedUploadUrl(fileName: string, contentType: string, type: string) {
    return this.http.post<{ url: string; key: string }>(
      `${environment.api}${API_ROUTES.S3.GENERATE_UPLOAD_URL}`,
      {
        folder: `trainer-verification/${type}`,
        fileName,
        contentType,
      }
    );
  }
}
