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
  currentUser$: Observable<any>;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted' | undefined;
  trainerId: string | null = null;
  rejectionReason: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private store: Store, private router: Router) {
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    const userSubscription = this.currentUser$.pipe(
      tap(user => {
        console.log('Current User:', user);
        if (user && user.role === 'trainer') {
          this.trainerId = user.id;
          this.verificationStatus = user.verificationStatus;
          this.rejectionReason = user.rejectionReason || null;
          console.log('Verification Status:', this.verificationStatus);
        } else {
          console.warn('No trainer data available');
          this.verificationStatus = undefined;
        }
      })
    ).subscribe();

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
