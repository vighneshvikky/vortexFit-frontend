import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { Trainer } from '../../../trainer/models/trainer.interface';
import { FormsModule } from '@angular/forms';
import {
  selectUnverifiedTrainers,
  selectUsersLoaded,
} from '../../../../store/admin/users/user.selector';
import {
  loadUnverifiedTrainers,
  loadUsers,
  resetUsersLoaded,
} from '../../../../store/admin/users/users.actions';
import { AdminService } from '../../services/admin.service';
import { NotyService } from '../../../../core/services/noty.service';
import {
  updateCurrentUserRejectionReason,
  updateCurrentUserVerificationStatus,
} from '../../../auth/store/actions/auth.actions';
import { selectCurrentUser } from '../../../auth/store/selectors/auth.selectors';
import { AppState } from '../../../../store/app.state';
import { REJECTION_REASONS } from '../../../../shared/constants/filter-options';

@Component({
  selector: 'app-admin-trainer-verification',
  imports: [CommonModule, FormsModule, AsyncPipe],
  templateUrl: './admin-trainer-verification.component.html',
  styleUrl: './admin-trainer-verification.component.scss',
})
export class AdminTrainerVerificationComponent implements OnInit {
  unverifiedTrainers$: Observable<Trainer[]>;
  selectedTrainer: Trainer | null = null;
  showRejectionModal = false;
  rejectionReason = '';

  selectedRejectionReason = '';
  customRejectionText = '';

  rejectionReasons = REJECTION_REASONS;

  approvingTrainers = new Set<string>();
  rejectingTrainers = new Set<string>();
  isSubmittingRejection = false;

  readonly S3_BASE_URL =
    'https://vortexfit-app-upload.s3.ap-south-1.amazonaws.com/';
  constructor(
    private store: Store<AppState>,
    private adminService: AdminService,
    private notyService: NotyService
  ) {
    this.unverifiedTrainers$ = this.store.select(selectUnverifiedTrainers);
  }

  ngOnInit(): void {
    this.store.dispatch(
      loadUnverifiedTrainers({ query: { page: 1, limit: 2 } })
    );
  }

  isApproving(trainerId: string): boolean {
    return this.approvingTrainers.has(trainerId);
  }

  isRejecting(trainerId: string): boolean {
    return this.rejectingTrainers.has(trainerId);
  }

  openTrainerModal(trainer: Trainer): void {
    const formatKey = (key: string | undefined | null): string | undefined =>
      key
        ? this.S3_BASE_URL + encodeURIComponent(key).replace(/%2F/g, '/')
        : undefined;

    this.selectedTrainer = {
      ...trainer,
      certificationUrl: formatKey(trainer.certificationUrl),
      idProofUrl: formatKey(trainer.idProofUrl),
    };
  }

  closeTrainerModal(): void {
    this.selectedTrainer = null;
  }

  openRejectionModal(trainer: Trainer): void {
    if (this.isRejecting(trainer._id)) return;
    this.selectedTrainer = trainer;
    this.showRejectionModal = true;
  }

  closeRejectionModal(): void {
    this.showRejectionModal = false;
    this.rejectionReason = '';
  }

  approveTrainer(trainer: Trainer): void {
    if (trainer && !this.isApproving(trainer._id)) {
      // Add trainer to approving set
      this.approvingTrainers.add(trainer._id);

      this.store
        .select(selectCurrentUser)
        .pipe(take(1))
        .subscribe((currentUser) => {
          if (currentUser && currentUser._id === trainer._id) {
            this.store.dispatch(
              updateCurrentUserVerificationStatus({ status: 'approved' })
            );
          }
        });

      this.adminService.acceptTrainer(trainer._id).subscribe({
        next: () => {
          this.notyService.showSuccess('Trainer approved successfully');
          this.closeTrainerModal();
          this.store.dispatch(
            loadUnverifiedTrainers({ query: { page: 1, limit: 2 } })
          );
          // Remove trainer from approving set
          this.approvingTrainers.delete(trainer._id);
        },
        error: (error) => {
          console.error('Error approving trainer:', error);
          this.notyService.showError(
            error?.error?.message || 'Failed to approve trainer'
          );
          // Remove trainer from approving set on error
          this.approvingTrainers.delete(trainer._id);
        },
      });
    }
  }
  isRejectionValid(): boolean {
    if (!this.selectedRejectionReason) return false;

    if (this.selectedRejectionReason === 'other') {
      return this.customRejectionText.trim().length > 0;
    }

    return true;
  }

  onRejectionReasonChange(reason: string): void {
    this.selectedRejectionReason = reason;
    if (reason !== 'other') {
      // Set the rejection reason based on selected option
      const selectedOption = this.rejectionReasons.find(
        (r) => r.value === reason
      );
      this.rejectionReason = selectedOption ? selectedOption.label : '';
    } else {
      this.rejectionReason = '';
    }
  }
  submitRejection(): void {
    if (
      !this.selectedTrainer?._id ||
      !this.rejectionReason.trim() ||
      this.isSubmittingRejection
    )
      return;

    // Set submitting rejection state
    this.isSubmittingRejection = true;

    // Step 1: Check if the trainer being rejected is the currently logged-in user
    this.store
      .select(selectCurrentUser)
      .pipe(take(1))
      .subscribe((currentUser) => {
        if (currentUser && currentUser._id === this.selectedTrainer!._id) {
          // Only update the auth state if the rejected trainer is the logged-in user
          this.store.dispatch(
            updateCurrentUserVerificationStatus({ status: 'rejected' })
          );
          this.store.dispatch(
            updateCurrentUserRejectionReason({ reason: this.rejectionReason })
          );
        }

        // Step 2: Proceed with rejection API call
        this.adminService
          .rejectTrainer(this.selectedTrainer!._id, this.rejectionReason)
          .subscribe({
            next: () => {
              this.notyService.showSuccess('Trainer rejected successfully');
              this.closeRejectionModal();
              this.closeTrainerModal();
              this.store.dispatch(loadUsers({ params: { role: 'trainer' } }));
              // Reset submitting state
              this.isSubmittingRejection = false;
            },
            error: (error) => {
              console.error('Error rejecting trainer:', error);
              this.notyService.showError(
                error?.error?.message || 'Failed to reject trainer'
              );
              // Reset submitting state on error
              this.isSubmittingRejection = false;
            },
          });
      });
  }
}
