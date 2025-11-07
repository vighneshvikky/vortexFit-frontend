import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.state';
import { selectCurrentUser } from '../../../features/auth/store/selectors/auth.selectors';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-icon',
  templateUrl: './notification-icon.component.html',
  styleUrl: './notification-icon.component.scss',
  imports: [CommonModule],
})
export class NotificationIconComponent implements OnInit, OnDestroy {
  @Input() userId!: string | null | undefined;

  notifications: any[] = [];
  unreadCount = 0;
  private sub!: Subscription;
  role: string = '';

  constructor(
    private notificationService: NotificationService,
    private store: Store<AppState>,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('This is from notificaiton icon component')
    this.store.select(selectCurrentUser).subscribe((user) => {
      if (user) {
        this.role = user.role;
      }
    });

    if (this.userId) {
      console.log('userId from notification icon', this.userId)
      this.notificationService.connect(this.userId);

      this.notificationService.getUnreadCountFromApi(this.userId).subscribe({
        next: (count) => this.notificationService.setUnreadCount(count),
        error: (err) => console.error('Error loading unread count', err),
      });
    }

    
    this.notificationService.getUnreadCount().subscribe((count) => {
      console.log('count', count);
      this.unreadCount = count;
      
    });
  }

  markAllRead() {
    this.unreadCount = 0;
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    this.notificationService.disconnect();
  }

  redirectToNotification() {
    if (!this.userId) return;

    this.unreadCount = 0;
    this.notifications.forEach((n) => (n.status = 'read'));

    this.notificationService.markAllAsRead(this.userId).subscribe({
      error: (err) => console.error('Failed to mark as read', err),
    });

    this.router.navigate([`${this.role}/notifications`]);
  }
}
