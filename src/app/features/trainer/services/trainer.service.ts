import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviorments/environment';


@Injectable({
  providedIn: 'root',
})
export class TrainerService {
  private apiUrl = `${environment.api}/trainers`;

  constructor(private http: HttpClient) {}



updateProfile(trainerId: string, profileData: any): Observable<any> {
 console.log('profileData', profileData)
  return this.http.patch(
    `http://localhost:3000/trainers/profile/${trainerId}`,
    profileData 
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
