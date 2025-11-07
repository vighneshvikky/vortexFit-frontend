import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { API_ROUTES } from '../../app.routes.constants';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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
  private unreadCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient, private socketService: SocketService) {}

  connect(userId: string) {
    this.socketService.connect(this.namespace, userId, environment.api);
    this.socketService.emit(this.namespace, 'joinRoom', userId);

    this.socketService
      .on<Notification>(this.namespace, 'newNotification')
      .subscribe((notification) => {
        console.log('🔔 Received new notification:', notification);

        const current = this.notifications$.value;
        console.log('Current notifications before update:', current);

        const exists = current.some((n) => n._id === notification._id);
        console.log('Already exists?', exists);

        if (!exists) {
          const updated = [notification, ...current];
          this.notifications$.next(updated);

          const unread = updated.filter((n) => n.status === 'unread').length;
          console.log('🔢 Updated unread count:', unread);

          this.unreadCount$.next(unread);
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
    const unread = list.filter((n) => n.status === 'unread').length;
    this.unreadCount$.next(unread);
  }

  onNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  onNewNotification() {
    console.log('getNewNotifications hello');
    return this.socketService.on<any>(this.namespace, 'newNotification');
  }

  getUnreadCountFromApi(userId: string): Observable<number> {
    return this.http.get<number>(`${this.api}/unread-count/${userId}`);
  }

  getNotifications(): Observable<Notification[]> {
    console.log('getNotification');
    return this.http.get<Notification[]>(`${this.api}`);
  }

  setUnreadCount(count: number) {
    this.unreadCount$.next(count);
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.api}/${id}/read`, {});
  }

  markAllAsRead(userId: string) {
    return this.http.patch(`${this.api}/mark-all-read/${userId}`, {}).pipe(
      tap(() => {
        this.unreadCount$.next(0);
      })
    );
  }

  disconnect() {
    if (this.socketService) this.socketService.disconnect(this.namespace);
  }
}
