import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { Trainer } from '../../../trainer/models/trainer.interface';
import { FormsModule } from '@angular/forms';
import {
  selectUnverifiedTrainers,
  selectUsersMeta,
} from '../../../../store/admin/users/user.selector';
import {
  loadUnverifiedTrainers,
  loadUsers,
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
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-trainer-verification',
  imports: [CommonModule, FormsModule, AsyncPipe, PaginationComponent],
  templateUrl: './admin-trainer-verification.component.html',
  styleUrl: './admin-trainer-verification.component.scss',
})
export class AdminTrainerVerificationComponent implements OnInit {
  unverifiedTrainers$: Trainer[] = [];
  selectedTrainer: Trainer | null = null;
  showRejectionModal = false;
  rejectionReason = '';

  selectedRejectionReason = '';
  customRejectionText = '';

  rejectionReasons = REJECTION_REASONS;

  approvingTrainers = new Set<string>();
  rejectingTrainers = new Set<string>();
  isSubmittingRejection = false;

  usersMeta$!: Observable<{
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }>;

  readonly S3_BASE_URL =
    'https://vortexfit-app-upload.s3.ap-south-1.amazonaws.com/';

  constructor(
    private store: Store<AppState>,
    private adminService: AdminService,
    private notyService: NotyService
  ) {
    // this.unverifiedTrainers$ = this.store.select(selectUnverifiedTrainers);
    this.usersMeta$ = this.store.select(selectUsersMeta);
  }

  ngOnInit(): void {
    this.store.dispatch(
      loadUnverifiedTrainers({ query: { page: 1, limit: 2 } })
    );
    this.store
      .select(selectUnverifiedTrainers)
      .subscribe((trainers) => (this.unverifiedTrainers$ = trainers));
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
      this.approvingTrainers.add(trainer._id);

      this.adminService.acceptTrainer(trainer._id).subscribe({
        next: () => {
          this.notyService.showSuccess('Trainer approved successfully');
          this.closeTrainerModal();
          // this.store.dispatch(
          //   loadUnverifiedTrainers({ query: { page: 1, limit: 2 } })
          // );
          this.unverifiedTrainers$ = this.unverifiedTrainers$.filter(t => t._id !== trainer._id);

          this.approvingTrainers.delete(trainer._id)
        },
        error: (error) => {
          console.error('Error approving trainer:', error);
          this.notyService.showError(
            error?.error?.message || 'Failed to approve trainer'
          );

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

  onPageChange(newPage: number): void {
    this.store.dispatch(
      loadUnverifiedTrainers({ query: { page: newPage, limit: 2 } })
    );
  }

  onRejectionReasonChange(reason: string): void {
    this.selectedRejectionReason = reason;
    if (reason !== 'other') {
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

    this.isSubmittingRejection = true;
    const rejectTrainerId = this.selectedTrainer._id;

    this.store
      .select(selectCurrentUser)
      .pipe(take(1))
      .subscribe((currentUser) => {
        if (currentUser && currentUser._id === this.selectedTrainer!._id) {
          this.store.dispatch(
            updateCurrentUserVerificationStatus({ status: 'rejected' })
          );
          this.store.dispatch(
            updateCurrentUserRejectionReason({ reason: this.rejectionReason })
          );
        }

        this.adminService
          .rejectTrainer(rejectTrainerId, this.rejectionReason)
          .subscribe({
            next: () => {
              this.notyService.showSuccess('Trainer rejected successfully');
              this.closeRejectionModal();
              this.closeTrainerModal();
             this.unverifiedTrainers$ = this.unverifiedTrainers$.filter(t => t._id !==  rejectTrainerId)
              this.isSubmittingRejection = false;
            },
            error: (error) => {
              console.error('Error rejecting trainer:', error);
              this.notyService.showError(
                error?.error?.message || 'Failed to reject trainer'
              );

              this.isSubmittingRejection = false;
            },
          });
      });
  }
}
