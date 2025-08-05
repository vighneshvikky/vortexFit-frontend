import { Component, inject } from '@angular/core';
import { TrainerSidebarComponent } from '../trainer-sidebar/trainer-sidebar.component';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../store/app.state';
import { logout } from '../../../../features/auth/store/actions/auth.actions';

@Component({
  selector: 'app-trainer-layout',
  imports: [TrainerSidebarComponent, RouterModule],
  templateUrl: './trainer-layout.component.html',
  styleUrl: './trainer-layout.component.scss'
})
export class TrainerLayoutComponent {
  private store = inject(Store<AppState>)
navItems = [
  { icon: 'fas fa-tachometer-alt', label: 'Dashboard', route: '/trainer/dashboard' },
  { icon: 'fas fa-calendar-check', label: 'Sessions', route: '/trainer/sessions' },
  { icon: 'fas fa-dumbbell', label: 'Availability', route: '/trainer/scheduling' },
  { icon: 'fas fa-chart-line', label: 'Client Progress', route: '/trainer/progress' },
  { icon: 'fas fa-comment-alt', label: 'Messaging', route: '/trainer/messaging' },
  { icon: 'fas fa-bell', label: 'Notifications', route: '/trainer/notifications' },
  { icon: 'fas fa-dollar-sign', label: 'Revenue', route: '/trainer/revenue' },
];


onLogout(): void{
  this.store.dispatch(logout())
}
}
