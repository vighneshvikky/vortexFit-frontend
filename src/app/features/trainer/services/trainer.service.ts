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

  updateProfile(profileData: Partial<Trainer>): Observable<Trainer> {
    profileData.verificationStatus = 'requested';
    return this.http.patch<Trainer>(
      `${this.apiUrl}/update-trainer-profile`,
      profileData
    );
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
