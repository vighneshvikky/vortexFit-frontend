import { Injectable } from '@angular/core';
import { environment } from '../../../enviorments/environment';
import { API_ROUTES } from '../../app.routes.constants';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { SocketService } from '../chat/services/socket.service';

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  message: string;
  status: 'read' | 'unread';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private namespace = 'notifications';

  private api = environment.api + API_ROUTES.NOTIFICATION.BASE;

  private notifications$ = new BehaviorSubject<Notification[]>([]);

  constructor(private http: HttpClient, private socketService: SocketService) {}

  connect(userId: string) {
    this.socketService.connect(this.namespace, userId, environment.api);
    this.socketService.emit(this.namespace, 'joinRoom', userId);

    this.socketService
      .on<Notification>(this.namespace, 'newNotification')
      .subscribe((notification) => {
        const current = this.notifications$.value;
        const exists = current.some((n) => n._id === notification._id);

        if (!exists) {
          this.notifications$.next([notification, ...current]);
        }
      });
  }

  loadInitialNotifications(): Observable<Notification[]> {
    console.log('hai');
    return this.http.get<Notification[]>(`${this.api}`);
  }
  deleteNotification(id: string): Observable<Notification> {
    return this.http.delete<Notification>(`${this.api}/${id}`);
  }

  setInitialNotifications(list: Notification[]) {
    this.notifications$.next(list);
  }

  onNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  onNewNotification() {
    return this.socketService.on<any>(this.namespace, 'newNotification');
  }

  getNotifications(): Observable<Notification[]> {
    console.log('getNotification');
    return this.http.get<Notification[]>(`${this.api}`);
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.api}/${id}/read`, {});
  }
}
