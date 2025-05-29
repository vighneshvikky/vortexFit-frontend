import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Trainer } from '../models/trainer.interface';
import { environment } from '../../../../enviorments/environment';

interface TrainerVerificationResponse {
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

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
  console.log('trainerId', trainerId);
  return this.http.patch(
    `http://localhost:3000/trainers/profile/${trainerId}`,
    formData 
  );
}

getSignedUploadUrl(fileName: string, contentType: string, type: 'certification' | 'idProof'){

  return this.http.post<{url: string, key: string}>('http://localhost:3000/s3/generate-upload-url',{
    folder: `trainer-verification/${type}`,
    fileName,
    contentType
  })
}



}
