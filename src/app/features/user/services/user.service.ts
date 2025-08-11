import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviorments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Trainer } from '../../trainer/models/trainer.interface';
import { User } from '../../admin/services/admin.service';
import { SchedulingRule } from '../../trainer/models/scheduling.interface';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.api}/user`;
  private scheduleUrl = `${environment.api}/schedules`

  constructor(private http: HttpClient) {}

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/update-profile`, data);
  }

  getTrainer(category?: string ): Observable<Trainer[]> {
    return this.http.get<Trainer[]>(`${this.apiUrl}/approved-trainer`, {
      params: {
        category: category || '',
      },
    });
  }

      generateSlots(trainerId: string): Observable<SchedulingRule[]>{
        // generateSlots/:trainerId
  return this.http.get<SchedulingRule[]>(`${this.scheduleUrl}/generateSlots/${trainerId}`)
  }

  getTrainerData(id: string): Observable<Trainer> {
    return this.http.get<Trainer>(`${this.apiUrl}/getTrainerData/${id}`);
  }

    getSignedUploadUrl(fileName: string, contentType: string, type: string) {
    return this.http.post<{ url: string; key: string }>(
      'http://localhost:3000/s3/generate-upload-url',
      {
        folder: `trainer-verification/${type}`,
        fileName,
        contentType,
      }
    );
  }


}
