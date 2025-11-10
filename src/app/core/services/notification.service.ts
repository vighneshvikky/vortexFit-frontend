import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { API_ROUTES } from '../../app.routes.constants';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
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
    console.log('🔌 Connecting to notifications socket for user:', userId);
    this.socketService.connect(this.namespace, userId, environment.socketUrl);
    this.socketService.emit(this.namespace, 'joinRoom', userId);


    this.socketService
      .on<Notification>(this.namespace, 'newNotification')
      .subscribe((notification) => {
        console.log('🔔 Received new notification:', notification);

        const current = this.notifications$.value;
        console.log('Current notifications before update:', current.length);

        const exists = current.some((n) => n._id === notification._id);
        console.log('Already exists?', exists);

        if (!exists) {
          const updated = [notification, ...current];
          this.notifications$.next(updated);
          
       
          this.recalculateUnreadCount(updated);
        }
      });


    this.socketService
      .on<{ notificationId: string }>(this.namespace, 'notificationRead')
      .subscribe((data) => {
        console.log('📖 Notification marked as read:', data.notificationId);
        this.updateNotificationStatus(data.notificationId, 'read');
      });


    this.socketService
      .on<{ userId: string }>(this.namespace, 'allNotificationsRead')
      .subscribe(() => {
        console.log('📚 All notifications marked as read');
        const current = this.notifications$.value;
        const updated = current.map(n => ({ ...n, status: 'read' as const }));
        this.notifications$.next(updated);
        this.unreadCount$.next(0);
      });

    // Listen for notification deletions from other sessions/devices
    this.socketService
      .on<{ notificationId: string }>(this.namespace, 'notificationDeleted')
      .subscribe((data) => {
        console.log('🗑️ Notification deleted:', data.notificationId);
        this.removeNotificationFromState(data.notificationId);
      });

    // CRITICAL: Listen for unread count updates from server
    this.socketService
      .on<{ count: number }>(this.namespace, 'unreadCountUpdate')
      .subscribe((data) => {
        console.log('🔢 Unread count update from server:', data.count);
        this.setUnreadCount(data.count);
      });
  }

  loadInitialNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.api}`).pipe(
      tap((notifications) => {
        console.log('📥 Loaded initial notifications:', notifications.length);
        this.setInitialNotifications(notifications);
      })
    );
  }

  deleteNotification(id: string): Observable<Notification> {
    return this.http.delete<Notification>(`${this.api}/${id}`).pipe(
      tap(() => {
        console.log('🗑️ Notification deleted from API:', id);
        this.removeNotificationFromState(id);
      })
    );
  }

  setInitialNotifications(list: Notification[]) {
    console.log('📝 Setting initial notifications:', list.length);
    this.notifications$.next(list);
    this.recalculateUnreadCount(list);
  }

  onNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  onNewNotification() {
    console.log('👂 Listening for new notifications');
    return this.socketService.on<Notification>(this.namespace, 'newNotification');
  }

  getUnreadCountFromApi(userId: string): Observable<number> {
    return this.http.get<{ count: number }>(`${this.api}/unread-count/${userId}`).pipe(
      tap((response) => {
        // Handle both response formats: { count: 6 } or just 6
        const count = typeof response === 'number' ? response : response.count;
        console.log('🔢 Unread count from API:', count);
        this.setUnreadCount(count);
      }),
      map((response) => typeof response === 'number' ? response : response.count)
    );
  }

  getNotifications(): Observable<Notification[]> {
    console.log('📋 Fetching notifications from API');
    return this.http.get<Notification[]>(`${this.api}`);
  }

  setUnreadCount(count: number) {
    console.log('🔢 Setting unread count to:', count);
    this.unreadCount$.next(Math.max(0, count));
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.api}/${id}/read`, {}).pipe(
      tap(() => {
        console.log('✅ Marked as read:', id);
        this.updateNotificationStatus(id, 'read');
      })
    );
  }

  markAllAsRead(userId: string): Observable<any> {
    return this.http.patch(`${this.api}/mark-all-read/${userId}`, {}).pipe(
      tap(() => {
        console.log('✅ Marked all notifications as read');
        const current = this.notifications$.value;
        const updated = current.map(n => ({ ...n, status: 'read' as const }));
        this.notifications$.next(updated);
        this.unreadCount$.next(0);
      })
    );
  }

  disconnect() {
    console.log('🔌 Disconnecting notifications socket');
    if (this.socketService) {
      this.socketService.disconnect(this.namespace);
    }
  }


  private updateNotificationStatus(id: string, status: 'read' | 'unread') {
    const current = this.notifications$.value;
    const updated = current.map(n => 
      n._id === id ? { ...n, status } : n
    );
    this.notifications$.next(updated);
    this.recalculateUnreadCount(updated);
  }


  private removeNotificationFromState(id: string) {
    const current = this.notifications$.value;
    const updated = current.filter(n => n._id !== id);
    this.notifications$.next(updated);
    this.recalculateUnreadCount(updated);
  }

  private recalculateUnreadCount(notifications: Notification[]) {
    const unread = notifications.filter(n => n.status === 'unread').length;
    console.log('🔢 Recalculated unread count:', unread);
    this.unreadCount$.next(unread);
  }
}