import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppState } from '../../../../store/app.state';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCurrentUserId } from '../../../../features/auth/store/selectors/auth.selectors';
import { NotificationIconComponent } from '../../notification-icon/notification-icon.component';

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  isCustomComponent?: boolean;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationIconComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  userId!: Observable<string | undefined>;
  constructor(private state: Store<AppState>) {}
  @Input() sidebarOpen = true;
  @Input() activeMenuItem = 'dashboard';
  @Input() userInfo = {
    name: 'Admin User',
    email: 'admin@vortexfit.com',
    avatar: 'https://randomuser.me/api/portraits/men/92.jpg',
  };
  @Input() menuItems: SidebarMenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
    { id: 'users', label: 'Users', icon: 'fa-users' },
    { id: 'verifications', label: 'Verifications', icon: 'fa-check-circle' },
    { id: 'plans', label: 'Plans', icon: 'fa-list-alt' },
    { id: 'transactions', label: 'Earnings', icon: 'fa-dollar-sign' },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'fa-bell',
      isCustomComponent: true,
    },
  ];

  @Output() menuItemClick = new EventEmitter<string>();
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  ngOnInit(): void {
    this.userId = this.state.select(selectCurrentUserId);
  }

  onMenuItemClick(itemId: string): void {
    this.activeMenuItem = itemId;
    this.menuItemClick.emit(itemId);
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }
}
