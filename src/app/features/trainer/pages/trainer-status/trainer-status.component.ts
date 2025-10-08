import { Component, OnInit, OnDestroy } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import {  Observable, tap, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  selectCurrentUser,
} from '../../../auth/store/selectors/auth.selectors';
import { Router, RouterModule } from '@angular/router';
import {
  AuthenticatedUser,
  fetchCurrentUser,
  
} from '../../../auth/store/actions/auth.actions';
import { AppState } from '../../../../store/app.state';
import { isTrainer } from '../../../../core/guards/user-type-guards';

@Component({
  selector: 'app-trainer-status',
  standalone: true,
  templateUrl: './trainer-status.component.html',
  styleUrls: ['./trainer-status.component.scss'],
  imports: [CommonModule, AsyncPipe, RouterModule],
})
export class TrainerStatusComponent implements OnInit, OnDestroy {
  currentUserStatus$: Observable<AuthenticatedUser | null>;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'requested' = 'pending';
  trainerId: string | null = null;
  rejectionReason: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private store: Store<AppState>, private router: Router) {
    this.currentUserStatus$ = this.store
      .select(selectCurrentUser)
  }

  ngOnInit(): void {
    this.store.dispatch(fetchCurrentUser());

    const userSubscription = this.currentUserStatus$
      .pipe(
        tap((user) => {
          if (isTrainer(user)) {
            this.verificationStatus = user?.verificationStatus;
            this.rejectionReason = user?.rejectionReason ?? null;
          }
        })
      )
      .subscribe();
    this.subscription.add(userSubscription);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  redirectToDashboard() {
    this.router.navigate(['/trainer/dashboard']);
  }

  submitFormAgain() {
    this.router.navigate(['/auth/trainer-requests']);
  }

  redirectToLogin() {
    this.router.navigate(['/auth/login'], { queryParams: { role: 'trainer' } });
  }
}
