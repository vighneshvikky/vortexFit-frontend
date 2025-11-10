import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
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
  private subscriptions = new Subscription();
  role: string = '';

  constructor(
    private notificationService: NotificationService,
    private store: Store<AppState>,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('🔔 NotificationIconComponent initialized');
    
    const userSub = this.store.select(selectCurrentUser).subscribe((user) => {
      if (user) {
        this.role = user.role;
      }
    });
    this.subscriptions.add(userSub);

    if (this.userId) {
      console.log('👤 userId from notification icon:', this.userId);
      
     
      const unreadSub = this.notificationService
        .getUnreadCount()
        .subscribe((count) => {
          console.log('🔢 Unread count updated in icon:', count);
          this.unreadCount = count;
        });
      this.subscriptions.add(unreadSub);

    
      this.notificationService.connect(this.userId);

  
      const loadSub = this.notificationService
        .loadInitialNotifications()
        .subscribe({
          next: (notifications) => {
            console.log('✅ Initial notifications loaded:', notifications.length);
          },
          error: (err) => console.error('❌ Error loading notifications', err),
        });
      this.subscriptions.add(loadSub);

   
      const notificationsSub = this.notificationService
        .onNotifications()
        .subscribe((notifications) => {
          console.log('📬 Notifications updated in icon:', notifications.length);
          this.notifications = notifications.slice(0, 5); 
        });
      this.subscriptions.add(notificationsSub);
    }
  }

  markAllRead() {
    if (!this.userId) return;

    console.log('📚 Marking all as read from icon');
    
    const markSub = this.notificationService
      .markAllAsRead(this.userId)
      .subscribe({
        next: () => {
          console.log('✅ All notifications marked as read');
          // The service will update the count automatically via socket
        },
        error: (err) => console.error('❌ Failed to mark as read', err),
      });
    this.subscriptions.add(markSub);
  }

  ngOnDestroy() {
    console.log('🧹 Cleaning up NotificationIconComponent');
    this.subscriptions.unsubscribe();
    // Don't disconnect - other components might still need the connection
  }

  redirectToNotification() {
    if (!this.userId) return;

    console.log('🔗 Redirecting to notifications page');
    this.router.navigate([`${this.role}/notifications`]);
  }
}