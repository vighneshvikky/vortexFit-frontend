import { Component, inject, HostListener } from '@angular/core';
import { TrainerSidebarComponent } from '../trainer-sidebar/trainer-sidebar.component';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../store/app.state';
import { logout } from '../../../../features/auth/store/actions/auth.actions';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trainer-layout',
  imports: [TrainerSidebarComponent, RouterModule, CommonModule],
  templateUrl: './trainer-layout.component.html',
  styleUrl: './trainer-layout.component.scss',
})
export class TrainerLayoutComponent {
  private store = inject(Store<AppState>);

  // Responsive properties
  isSidebarOpen = false;
  isDesktop = true;

  navItems = [
    {
      icon: 'fas fa-tachometer-alt',
      label: 'Dashboard',
      route: '/trainer/dashboard',
    },
    {
      icon: 'fas fa-calendar-check',
      label: 'Sessions',
      route: '/trainer/sessions',
    },
    {
      icon: 'fas fa-dumbbell',
      label: 'Availability',
      route: '/trainer/scheduling',
    },

    {
      icon: 'fas fa-message',
      label: 'Messages',
      route: '/trainer/chat',
    },

    {
      icon: 'fas fa-bell',
      label: 'Notifications',
      route: '/trainer/notifications',
      isCustomComponent: true,
    },
    {
      icon: 'fas fa-dollar-sign',
      label: 'Transactions',
      route: '/trainer/transactions',
    },
    { icon: 'fas fa-file-contract', label: 'Plans', route: '/trainer/plans' },
  ];

  constructor() {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isDesktop = window.innerWidth >= 1024;
    if (this.isDesktop) {
      this.isSidebarOpen = false;
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
    this.closeSidebar();
  }

  onMobileSidebarClose(): void {
    this.closeSidebar();
  }
}
