import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviorments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Trainer } from '../../trainer/models/trainer.interface';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.api}/user`;

  constructor(private http: HttpClient) {}

  updateProfile(data: any) {
    console.log('data from user profile', data);
    return this.http.patch(`${this.apiUrl}/update-profile`, data);
  }

  getTrainer(category?: string ): Observable<Trainer[]> {
    return this.http.get<Trainer[]>(`${this.apiUrl}/approved-trainer`, {
      params: {
        category: category || '',
      },
    });
  }

  getTrainerData(id: string): Observable<Trainer> {
    return this.http.get<Trainer>(`${this.apiUrl}/getTrainerData/${id}`);
  }
}
