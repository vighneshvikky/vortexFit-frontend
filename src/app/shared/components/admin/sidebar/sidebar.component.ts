import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
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
      id: 'notifications', label: 'Notifications', icon: 'fa-bell '
    }
  ];

  @Output() menuItemClick = new EventEmitter<string>();
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

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
