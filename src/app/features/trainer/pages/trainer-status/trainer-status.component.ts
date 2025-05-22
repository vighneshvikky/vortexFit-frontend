import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable, tap, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  selectCurrentUser,
  selectCurrentUserVerificationStatus,
} from '../../../auth/store/selectors/auth.selectors';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trainer-status',
  standalone: true,
  templateUrl: './trainer-status.component.html',
  styleUrls: ['./trainer-status.component.scss'],
  imports: [CommonModule],
})
export class TrainerStatusComponent implements OnInit, OnDestroy {
  currentUserStatus$: Observable<any>;
  verificationStatus:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'not_submitted'
    | undefined;
  trainerId: string | null = null;
  rejectionReason: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private store: Store, private router: Router) {
    this.currentUserStatus$ = this.store.select(
      selectCurrentUserVerificationStatus
    );
  }

  ngOnInit(): void {
    const userSubscription = this.currentUserStatus$
      .pipe(
        tap((user) => {
          console.log('user', user);
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
    this.router.navigate(['/trainer/trainer-requests']);
  }
}
