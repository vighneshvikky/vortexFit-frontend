import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCurrentUser } from '../../../../features/auth/store/selectors/auth.selectors';
import { AuthenticatedUser } from '../../../../features/auth/store/actions/auth.actions';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppState } from '../../../../store/app.state';
import { onImageError } from '../../../methods/image-checker';

@Component({
  selector: 'app-trainer-sidebar',
  imports: [AsyncPipe, CommonModule, RouterModule],
  templateUrl: './trainer-sidebar.component.html',
  styleUrl: './trainer-sidebar.component.scss',
})
export class TrainerSidebarComponent implements OnInit {
  @Input() navItems: Array<{ icon: string; label: string; route: string }> = [];
  @Output() logout = new EventEmitter<void>();
  @Output() closeMobileSidebar = new EventEmitter<void>();

  constructor(private store: Store<AppState>) {}
  
  $currentTrainer!: Observable<AuthenticatedUser | null>;
  
  ngOnInit(): void {
    this.$currentTrainer = this.store.select(selectCurrentUser);
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