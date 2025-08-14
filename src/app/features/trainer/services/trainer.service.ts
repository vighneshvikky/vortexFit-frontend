import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviorments/environment';
import { Trainer } from '../models/trainer.interface';
import { VerificationStatus } from '../enums/verification-status.enum';
import { API_ROUTES } from '../../../app.routes.constants';

@Injectable({
  providedIn: 'root',
})
export class TrainerService {
  private apiUrl = environment+API_ROUTES.TRAINER.BASE;

  constructor(private http: HttpClient) {}

  updateProfile(profileData: Partial<Trainer>): Observable<Trainer> {
    return this.http.patch<Trainer>(
      `${this.apiUrl}${API_ROUTES.TRAINER.UPDATE_PROFILE}`,
      profileData
    );
  }
  updateVerificationProfile(
    profileData: Partial<Trainer>
  ): Observable<Trainer> {
    profileData.verificationStatus = VerificationStatus.Pending; 
    return this.http.patch<Trainer>(
      `${this.apiUrl}${API_ROUTES.TRAINER.UPDATE_PROFILE}`,
      profileData
    );
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
