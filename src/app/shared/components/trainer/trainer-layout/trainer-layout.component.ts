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
      icon: 'fas fa-bell',
      label: 'Notifications',
      route: '/trainer/notifications',
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
}
