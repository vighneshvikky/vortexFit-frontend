import { Component, inject, OnDestroy } from '@angular/core';
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
export class UserSpecificLayoutComponent implements OnDestroy {
  private store = inject(Store<AppState>);

  // Responsive properties
  isSidebarOpen = false;
  isDesktop = true;

  navItems: NavItem[] = [
    {
      icon: 'fas fa-tachometer-alt',
      label: 'Dashboard',
      route: '/user/statistics',
    },
    {
      icon: 'fas fa-calendar-check',
      label: 'My Sessions',
      route: '/user/my-sessions',
    },
    { icon: 'fas fa-file-contract', label: 'Plans', route: '/user/plans' },
    {
      icon: 'fas fa-credit-card',
      label: 'Transactions',
      route: '/user/transactions',
    },
    {
      icon: 'fas fa-bell',
      label: 'Notifications',
      route: '/user/notifications',
    },
    {
      icon: 'fas fa-message',
      label: 'Messages',
      route: '/user/chat',
    },
    {
      icon: 'fas fa-robot',
      label: 'Ai-Assistant',
      route: '/user/ask-ai',
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

  // Listen to window resize events
  // @HostListener('window:resize', ['$event'])
  // onResize(event: Event): void {
  //   this.checkScreenSize();
  // }

  // Check screen size and update responsive properties
  checkScreenSize(): void {
    const wasDesktop = this.isDesktop;
    this.isDesktop = window.innerWidth >= 1024;
    
    // Close sidebar when switching from mobile to desktop
    if (!wasDesktop && this.isDesktop) {
      this.isSidebarOpen = false;
    }
  }

  // Toggle sidebar visibility (mobile only)
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    
    // Prevent body scroll when sidebar is open on mobile
    if (this.isSidebarOpen && !this.isDesktop) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // Close sidebar
  closeSidebar(): void {
    this.isSidebarOpen = false;
    document.body.style.overflow = '';
  }

  // Handle logout
  onLogout(): void {
    this.store.dispatch(logout());
    this.closeSidebar();
  }

  // Handle mobile sidebar close
  onMobileSidebarClose(): void {
    this.closeSidebar();
  }

  // Update message badge count
  updateMessageBadge(count: number): void {
    const messagesItem = this.navItems.find(
      (item) => item.route === '/user/chat'
    );
    if (messagesItem) {
      messagesItem.badge = count > 0 ? count : undefined;
    }
  }

  // Update user stats
  updateUserStats(stats: UserStats): void {
    this.userStats = { ...this.userStats, ...stats };
  }

  // Cleanup on component destroy
  ngOnDestroy(): void {
    // Restore body scroll
    document.body.style.overflow = '';
  }
}