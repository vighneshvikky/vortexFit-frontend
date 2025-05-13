import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  sidebarOpen = true;
  activeMenuItem = 'dashboard';

  // Dummy data for dashboard
  stats = [
    { label: 'Total Users', value: '2,543', icon: 'fa-users', change: '+12%', color: 'bg-blue-500' },
    { label: 'Active Trainers', value: '156', icon: 'fa-dumbbell', change: '+8%', color: 'bg-green-500' },
    { label: 'Monthly Revenue', value: '$12,450', icon: 'fa-dollar-sign', change: '+23%', color: 'bg-purple-500' },
    { label: 'Pending Verifications', value: '23', icon: 'fa-check-circle', change: '-5%', color: 'bg-yellow-500' }
  ];

  recentActivities = [
    { user: 'John Doe', action: 'joined as a new user', time: '2 minutes ago', type: 'user' },
    { user: 'Sarah Smith', action: 'completed trainer verification', time: '1 hour ago', type: 'trainer' },
    { user: 'Mike Johnson', action: 'purchased premium plan', time: '3 hours ago', type: 'user' },
    { user: 'Emma Wilson', action: 'started new training program', time: '5 hours ago', type: 'trainer' }
  ];

  constructor(private router: Router) {}

  onMenuItemClick(itemId: string): void {
    this.activeMenuItem = itemId;
    // Handle navigation based on menu item
    switch (itemId) {
      case 'dashboard':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'users':
        this.router.navigate(['/admin/users']);
        break;
      // Add other cases as needed
    }
  }

  onToggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onLogout(): void {
    // Handle logout
    this.router.navigate(['/admin/login']);
  }
}
