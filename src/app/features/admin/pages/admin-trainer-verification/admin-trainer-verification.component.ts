import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { Trainer } from '../../../trainer/models/trainer.interface';
import { FormsModule } from '@angular/forms';
import { selectUnverifiedTrainers, selectUsersLoaded } from '../../../../store/admin/users/user.selector';
import { loadUsers } from '../../../../store/admin/users/users.actions';
import { AdminService } from '../../services/admin.service';
import { NotyService } from '../../../../core/services/noty.service';

@Component({
  selector: 'app-admin-trainer-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe],
  templateUrl: './admin-trainer-verification.component.html',
  styleUrl: './admin-trainer-verification.component.scss'
})
export class AdminTrainerVerificationComponent implements OnInit {
  unverifiedTrainers$: Observable<Trainer[]>;
  selectedTrainer: Trainer | null = null;
  showRejectionModal = false;
  rejectionReason = '';
  

  constructor(
    private store: Store,
    private adminService: AdminService,
    private notyService: NotyService
  ) {
    this.unverifiedTrainers$ = this.store.select(selectUnverifiedTrainers);
  }

  ngOnInit(): void {
    this.store.select(selectUsersLoaded).pipe(take(1)).subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(loadUsers({ params: { role: 'trainer' } }));
      }
    });
  }

  openTrainerModal(trainer: Trainer): void {
    this.selectedTrainer = trainer;
  }

  closeTrainerModal(): void {
    this.selectedTrainer = null;
  }

  openRejectionModal(trainer: Trainer): void {
    this.selectedTrainer = trainer;
    this.showRejectionModal = true;
  }

  closeRejectionModal(): void {
    this.showRejectionModal = false;
    this.rejectionReason = '';
  }

  approveTrainer(trainer: Trainer): void {
    
    if (trainer) {
      this.adminService.acceptTrainer(trainer._id).subscribe({
        next: () => {
          this.notyService.showSuccess('Trainer approved successfully');
          this.closeTrainerModal();
          this.store.dispatch(loadUsers({ params: { role: 'trainer' } }));
        },
        error: (error) => {
          console.error('Error approving trainer:', error);
          this.notyService.showError(error?.error?.message || 'Failed to approve trainer');
        }
      });
    }
  }

  submitRejection(): void {
    console.log('rejctedTrainer', this.selectedTrainer)
     if (this.selectedTrainer?._id && this.rejectionReason.trim()) {
      this.adminService.rejectTrainer(this.selectedTrainer._id, this.rejectionReason).subscribe({
        next: () => {
          this.notyService.showSuccess('Trainer rejected successfully');
          this.closeRejectionModal();
          this.closeTrainerModal();
          this.store.dispatch(loadUsers({ params: { role: 'trainer' } }));
        },
        error: (error) => {
          console.error('Error rejecting trainer:', error);
          this.notyService.showError(error?.error?.message || 'Failed to reject trainer');
        }
      
      });
     }
  }
}
