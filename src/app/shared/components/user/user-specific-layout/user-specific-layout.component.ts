import { Component, inject, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../store/app.state';
import { logout } from '../../../../features/auth/store/actions/auth.actions';
import { CommonModule } from '@angular/common';
import { ProfileSidebarComponent } from '../profile-sidebar/profile-sidebar.component';

export interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

export interface UserStats {
  workouts: number;
  streak: number;
  totalHours?: number;
  achievements?: number;
}

@Component({
  selector: 'app-user-specific-layout',
  imports: [ProfileSidebarComponent, RouterModule, CommonModule],
  templateUrl: './user-specific-layout.component.html',
  styleUrl: './user-specific-layout.component.scss',
})
export class UserSpecificLayoutComponent {
  private store = inject(Store<AppState>);

  // Responsive properties
  isSidebarOpen = false;
  isDesktop = true;

  navItems: NavItem[] = [
    {
      icon: 'fas fa-tachometer-alt',
      label: 'Dashboard',
      route: '/user/dashboard',
    },
    {
      icon: 'fas fa-calendar-check',
      label: 'My Sessions',
      route: '/user/my-sessions',
    },
    { icon: 'fas fa-users', label: 'Trainers', route: '/user/trainers' },
    { icon: 'fas fa-file-contract', label: 'Plans', route: '/user/plans' },
    {
      icon: 'fas fa-credit-card',
      label: 'Transactions',
      route: '/user/transactions',
    },
  ];

  // User statistics (you can fetch this from your store/service)
  userStats: UserStats = {
    workouts: 25,
    streak: 7,
    totalHours: 45,
    achievements: 12,
  };

  constructor() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  // onResize(event: any): void {
  //   this.checkScreenSize();
  // }
  checkScreenSize(): void {
    this.isDesktop = window.innerWidth >= 1024; // lg breakpoint
    if (this.isDesktop) {
      this.isSidebarOpen = false; // Always closed on desktop since it's always visible
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  onLogout(): void {
    this.store.dispatch(logout());
    this.closeSidebar(); // Close sidebar after logout
  }

  onMobileSidebarClose(): void {
    this.closeSidebar();
  }

  // Method to update message badge count (you can call this from your messaging service)
  updateMessageBadge(count: number): void {
    const messagesItem = this.navItems.find(
      (item) => item.route === '/user/messages'
    );
    if (messagesItem) {
      messagesItem.badge = count > 0 ? count : undefined;
    }
  }

  // Method to update user stats (you can call this from your user service)
  updateUserStats(stats: UserStats): void {
    this.userStats = { ...this.userStats, ...stats };
  }
}
