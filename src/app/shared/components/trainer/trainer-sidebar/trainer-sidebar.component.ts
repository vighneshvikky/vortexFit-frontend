import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCurrentUser } from '../../../../features/auth/store/selectors/auth.selectors';
import { AuthenticatedUser } from '../../../../features/auth/store/actions/auth.actions';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-trainer-sidebar',
  imports: [AsyncPipe, CommonModule, RouterModule],
  templateUrl: './trainer-sidebar.component.html',
  styleUrl: './trainer-sidebar.component.scss',
})
export class TrainerSidebarComponent implements OnInit {
  constructor(private store: Store) {}
  $currentTrainer!: Observable<AuthenticatedUser | null>;
  ngOnInit(): void {
    this.$currentTrainer = this.store.select(selectCurrentUser);
  }


  onImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = 'assets/images/default-user.png'; 
}
}
