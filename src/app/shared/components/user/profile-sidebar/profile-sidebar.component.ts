import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppState } from '../../../../store/app.state';
import { Store } from '@ngrx/store';
import { AuthenticatedUser } from '../../../../features/auth/store/actions/auth.actions';
import { Observable } from 'rxjs';
import { selectCurrentUser } from '../../../../features/auth/store/selectors/auth.selectors';
import { onImageError } from '../../../methods/image-checker';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
export interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number; // Optional badge count for notifications
}

export interface UserStats {
  workouts: number;
  streak: number;
  totalHours?: number;
  achievements?: number;
}

@Component({
  selector: 'app-profile-sidebar',
  imports: [RouterLink, CommonModule],
  templateUrl: './profile-sidebar.component.html',
  styleUrl: './profile-sidebar.component.scss'
})
export class ProfileSidebarComponent {
@Input() navItems: NavItem[] = [
    {
      icon: 'fas fa-tachometer-alt',
      label: 'Dashboard',
      route: '/user/dashboard'
    },
    {
      icon: 'fas fa-calendar-check',
      label: 'My Sessions',
      route: '/user/sessions'
    },
    {
      icon: 'fas fa-comments',
      label: 'Messages',
      route: '/user/messages',
      badge: 3 // Example badge count
    },
    {
      icon: 'fas fa-dumbbell',
      label: 'Workouts',
      route: '/user/workouts'
    },
    {
      icon: 'fas fa-chart-line',
      label: 'Progress',
      route: '/user/progress'
    },
    {
      icon: 'fas fa-users',
      label: 'Trainers',
      route: '/user/trainers'
    },
    {
      icon: 'fas fa-calendar-alt',
      label: 'Schedule',
      route: '/user/schedule'
    },
    {
      icon: 'fas fa-cog',
      label: 'Settings',
      route: '/user/settings'
    }
  ];

  @Input() userStats: UserStats | null = {
    workouts: 15,
    streak: 7
  };

  @Output() logout = new EventEmitter<void>();
  @Output() closeMobileSidebar = new EventEmitter<void>();

  constructor(private store: Store<AppState>) {}
    
  $currentUser!: Observable<AuthenticatedUser | null>;
    
  ngOnInit(): void {
    this.$currentUser = this.store.select(selectCurrentUser);
  }

  onImageError(event: Event) {
    onImageError(event);
  }

  onLogout(): void {
    this.logout.emit();
  }

  onMobileNavClick(): void {
    // Close sidebar on mobile after navigation
    this.closeMobileSidebar.emit();
  }

  closeSidebar(): void {
    this.closeMobileSidebar.emit();
  }
}
