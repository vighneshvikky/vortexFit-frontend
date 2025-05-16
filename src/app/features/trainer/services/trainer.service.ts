import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviorments/environment';
import { Trainer } from '../models/trainer.interface';

@Injectable({
  providedIn: 'root',
})
export class TrainerService {
  private apiUrl = `${environment.api}/trainers`;

  constructor(private http: HttpClient) {}

// updateProfile(trainerId: string, formData: FormData): Observable<Trainer> {
//   console.log('formData', formData);
//   return this.http.patch<Trainer>(`${this.apiUrl}/profile/${trainerId}`, formData);
// }

updateProfile(trainerId: string, formData: FormData): Observable<any> {
  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }
  return this.http.patch(
    `http://localhost:3000/trainers/profile/${trainerId}`,
    formData 
  );
}

}
