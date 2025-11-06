import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  selectCurrentUser,
  selectCurrentUserId,
} from '../../../../features/auth/store/selectors/auth.selectors';
import { AuthenticatedUser } from '../../../../features/auth/store/actions/auth.actions';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppState } from '../../../../store/app.state';
import { onImageError } from '../../../methods/image-checker';
import { NotificationIconComponent } from '../../notification-icon/notification-icon.component';

@Component({
  selector: 'app-trainer-sidebar',
  imports: [AsyncPipe, CommonModule, RouterModule, NotificationIconComponent],
  templateUrl: './trainer-sidebar.component.html',
  styleUrl: './trainer-sidebar.component.scss',
})
export class TrainerSidebarComponent implements OnInit {
  @Input() navItems: Array<{
    icon: string;
    label: string;
    route: string;
    isCustomComponent?: boolean;
  }> = [];
  @Output() logout = new EventEmitter<void>();
  @Output() closeMobileSidebar = new EventEmitter<void>();
  userId!: Observable<string | undefined>;

  constructor(private store: Store<AppState>) {}

  $currentTrainer!: Observable<AuthenticatedUser | null>;

  ngOnInit(): void {
    this.$currentTrainer = this.store.select(selectCurrentUser);
    this.userId = this.store.select(selectCurrentUserId);
  }

  onImageError(event: Event) {
    onImageError(event);
  }

  onLogout(): void {
    this.logout.emit();
  }

  onMobileNavClick(): void {
    this.closeMobileSidebar.emit();
  }

  closeSidebar(): void {
    this.closeMobileSidebar.emit();
  }
}
