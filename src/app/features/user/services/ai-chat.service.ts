import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../../app.routes.constants';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AiChatService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.api + API_ROUTES.AI.BASE;

  chat(message: string, personality: string) {
    return this.http.post<{ reply: string }>(this.apiUrl, {
      message,
      personality,
    });
  }
}
