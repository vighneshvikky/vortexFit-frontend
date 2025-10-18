import { Component, OnInit } from '@angular/core';
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
export class NotificationComponent implements OnInit {
  role!: string;
  notifications: Notification[] = [];
  userId!: string | undefined;
  unreadCount = 0;
  loading = false;
  selectedFilter: 'all' | 'unread' | 'read' = 'all';
  selectedType: string = 'all';
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private store: Store<AppState>
  ) {}

    ngOnInit(): void {
    this.role = this.route.snapshot.data['role'];

    this.store
      .select(selectCurrentUserId)
      .pipe(take(1))
      .subscribe((userId) => {
        this.userId = userId;
        console.log('userId', userId);
        if (this.userId) {
          this.notificationService.connect(this.userId);

          const notifSub = this.notificationService
            .onNotifications()
            .subscribe((newNotifications: Notification[] | Notification) => {
              if (Array.isArray(newNotifications)) {
            
                newNotifications.forEach((newNotif) => {
         
                  const exists = this.notifications.some(
                    (n) => n._id === newNotif._id
                  );
                  if (!exists) {

                    this.notifications.unshift(newNotif);
                  }
                });
              } else {
          
                const exists = this.notifications.some(
                  (n) => n._id === newNotifications._id
                );
                if (!exists) {
                  this.notifications.unshift(newNotifications);
                }
              }

              this.unreadCount = this.notifications.filter(
                (n) => n.status === 'unread'
              ).length;
            });

          this.subscriptions.push(notifSub);

          this.loadNotifications();
        }
      });
  }

  loadNotifications() {
    console.log('loading notification')
    this.loading = true;
    this.notificationService.getNotifications().subscribe({
      next: (res) => {
        this.notifications = res;
        this.unreadCount = res.filter((n) => n.status === 'unread').length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        this.loading = false;
      },
    });
  }

  get filteredNotifications() {
    let filtered = [...this.notifications];

    // Filter by status
    if (this.selectedFilter === 'unread') {
      filtered = filtered.filter((n) => n.status === 'unread');
    } else if (this.selectedFilter === 'read') {
      filtered = filtered.filter((n) => n.status === 'read');
    }

    // Filter by type
    if (this.selectedType !== 'all') {
      filtered = filtered.filter((n) => n.type === this.selectedType);
    }

    return filtered;
  }

  markAsRead(id: string) {
    const notification = this.notifications.find((n) => n._id === id);
    if (notification && notification.status === 'unread') {
      this.notificationService.markAsRead(id).subscribe(() => {
        notification.status = 'read';
        this.unreadCount--;
      });
    }
  }

  markAllAsRead() {
    const unreadIds = this.notifications
      .filter((n) => n.status === 'unread')
      .map((n) => n._id);

    if (unreadIds.length === 0) return;
  }

  deleteNotification(id: string, event: Event) {
    event.stopPropagation();
    this.notificationService.deleteNotification(id).subscribe(() => {
      const index = this.notifications.findIndex((n) => n._id === id);
      if (index > -1) {
        if (this.notifications[index].status === 'unread') {
          this.unreadCount--;
        }
        this.notifications.splice(index, 1);
      }
    });
  }

  deleteAllRead() {
    const readIds = this.notifications
      .filter((n) => n.status === 'read')
      .map((n) => n._id);

    if (readIds.length === 0) return;
  }

  setFilter(filter: 'all' | 'unread' | 'read') {
    this.selectedFilter = filter;
  }

  setTypeFilter(type: string) {
    this.selectedType = type;
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      booking: '📅',
      subscription: '⭐',
      payment: '💳',
      system: '⚙️',
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
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
