import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  
})
export class SidebarComponent {
  @Input() sidebarOpen = true;
  @Input() activeMenuItem = 'dashboard';
  @Input() userInfo = {
    name: 'Admin User',
    email: 'admin@vortexfit.com',
    avatar: 'https://randomuser.me/api/portraits/men/92.jpg'
  };
  @Input() menuItems: SidebarMenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
    { id: 'users', label: 'Users', icon: 'fa-users' },
    { id: 'trainers', label: 'Trainers', icon: 'fa-dumbbell' },
    { id: 'verifications', label: 'Verifications', icon: 'fa-check-circle', badge: 3 },
    { id: 'plans', label: 'Plans', icon: 'fa-list-alt' },
    { id: 'earnings', label: 'Earnings', icon: 'fa-dollar-sign' },
    { id: 'notifications', label: 'Notifications', icon: 'fa-bell', badge: 5 },
    { id: 'settings', label: 'Settings', icon: 'fa-cog' }
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