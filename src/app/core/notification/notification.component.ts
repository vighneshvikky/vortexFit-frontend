import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Notification,
  NotificationService,
} from '../services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { selectCurrentUserId } from '../../features/auth/store/selectors/auth.selectors';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
})
export class NotificationComponent implements OnInit, OnDestroy {
  role!: string;
  notifications: Notification[] = [];
  userId!: string | undefined;
  unreadCount = 0;
  loading = false;
  selectedFilter: 'all' | 'unread' | 'read' = 'all';
  selectedType: string = 'all';
  private subscriptions = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    console.log('📄 NotificationComponent initialized');
    this.role = this.route.snapshot.data['role'];

    const userSub = this.store
      .select(selectCurrentUserId)
      .pipe(take(1))
      .subscribe((userId) => {
        this.userId = userId;
        console.log('👤 User ID:', userId);
        
        if (this.userId) {
          this.initializeNotifications();
        }
      });
    this.subscriptions.add(userSub);
  }

  private initializeNotifications(): void {
    if (!this.userId) return;

    console.log('🔄 Initializing notifications for user:', this.userId);


    this.notificationService.connect(this.userId);

   
    this.loadNotifications();

   
    const notifSub = this.notificationService
      .onNotifications()
      .subscribe((notificationList: Notification[]) => {
        console.log('📬 Notifications updated from service:', notificationList.length);
        this.notifications = notificationList;
        this.unreadCount = notificationList.filter((n) => n.status === 'unread').length;
        console.log('🔢 Local unread count:', this.unreadCount);
      });
    this.subscriptions.add(notifSub);


    const countSub = this.notificationService
      .getUnreadCount()
      .subscribe((count) => {
        console.log('🔢 Unread count from service:', count);
        this.unreadCount = count;
      });
    this.subscriptions.add(countSub);

  
    this.markAllAsReadOnPageView();
  }

  private markAllAsReadOnPageView(): void {
    if (!this.userId) return;

    console.log('📖 Marking all notifications as read on page view');
    
    const markReadSub = this.notificationService
      .markAllAsRead(this.userId)
      .subscribe({
        next: () => {
          console.log('✅ Successfully marked all as read');
        },
        error: (err) => console.error('❌ Failed to mark as read', err),
      });
    this.subscriptions.add(markReadSub);
  }

  loadNotifications(): void {
    console.log('🔄 Loading notifications from API');
    this.loading = true;

    const loadSub = this.notificationService
      .loadInitialNotifications()
      .subscribe({
        next: (notifications) => {
          console.log('✅ Notifications loaded:', notifications.length);
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Error loading notifications:', err);
          this.loading = false;
        },
      });
    this.subscriptions.add(loadSub);
  }

  get filteredNotifications(): Notification[] {
    let filtered = [...this.notifications];

    if (this.selectedFilter === 'unread') {
      filtered = filtered.filter((n) => n.status === 'unread');
    } else if (this.selectedFilter === 'read') {
      filtered = filtered.filter((n) => n.status === 'read');
    }

  
    if (this.selectedType !== 'all') {
      filtered = filtered.filter((n) => n.type === this.selectedType);
    }

    return filtered;
  }

  markAsRead(id: string): void {
    const notification = this.notifications.find((n) => n._id === id);
    

    if (notification && notification.status === 'unread') {
      console.log('📖 Marking notification as read:', id);
      
      const markSub = this.notificationService.markAsRead(id).subscribe({
        next: () => {
          console.log('✅ Successfully marked notification as read');

        },
        error: (err) => {
          console.error('❌ Error marking as read:', err);
        }
      });
      this.subscriptions.add(markSub);
    }
  }

  markAllAsRead(): void {
    if (!this.userId) return;

    const unreadNotifications = this.notifications.filter(
      (n) => n.status === 'unread'
    );

    if (unreadNotifications.length === 0) {
      console.log('ℹ️ No unread notifications to mark');
      return;
    }

    console.log('📖 Marking all notifications as read');

    const markSub = this.notificationService
      .markAllAsRead(this.userId)
      .subscribe({
        next: () => {
          console.log('✅ Successfully marked all as read');
        },
        error: (err) => {
          console.error('❌ Failed to mark all as read:', err);
        }
      });
    this.subscriptions.add(markSub);
  }

  deleteNotification(id: string, event: Event): void {
    event.stopPropagation();
    
    console.log('🗑️ Deleting notification:', id);

    const deleteSub = this.notificationService
      .deleteNotification(id)
      .subscribe({
        next: () => {
          console.log('✅ Successfully deleted notification');
        },
        error: (err) => {
          console.error('❌ Error deleting notification:', err);
        }
      });
    this.subscriptions.add(deleteSub);
  }

  deleteAllRead(): void {
    const readNotifications = this.notifications.filter(
      (n) => n.status === 'read'
    );

    if (readNotifications.length === 0) {
      console.log('ℹ️ No read notifications to delete');
      return;
    }

    console.log('🗑️ Deleting all read notifications:', readNotifications.length);

    readNotifications.forEach((notification) => {
      const deleteSub = this.notificationService
        .deleteNotification(notification._id)
        .subscribe({
          next: () => {
            console.log('✅ Deleted notification:', notification._id);
          },
          error: (err) => {
            console.error('❌ Error deleting notification:', notification._id, err);
          }
        });
      this.subscriptions.add(deleteSub);
    });
  }

  setFilter(filter: 'all' | 'unread' | 'read'): void {
    console.log('🔍 Setting filter to:', filter);
    this.selectedFilter = filter;
  }

  setTypeFilter(type: string): void {
    console.log('🔍 Setting type filter to:', type);
    this.selectedType = type;
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      booking: '📅',
      subscription: '⭐',
      payment: '💳',
      system: '⚙️',
      message: '💬',
      alert: '⚠️',
    };
    return icons[type] || '🔔';
  }

  getNotificationIconClass(type: string): string {
    return `icon-${type}`;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationDate.toLocaleDateString();
  }

  formatTimestamp(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  ngOnDestroy(): void {
    console.log('🧹 Cleaning up NotificationComponent');
    this.subscriptions.unsubscribe();
 
  }
}