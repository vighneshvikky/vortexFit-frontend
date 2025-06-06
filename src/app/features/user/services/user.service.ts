import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviorments/environment';
import { Injectable } from '@angular/core';
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
}
