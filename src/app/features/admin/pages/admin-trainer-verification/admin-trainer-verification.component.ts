import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Trainer } from '../../../trainer/models/trainer.interface';
import * as TrainerActions from '../../../../store/admin/trainers/trainers.actions';
import * as TrainerSelectors from '../../../../store/admin/trainers/trainers.selectors';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-trainer-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-trainer-verification.component.html',
  styleUrl: './admin-trainer-verification.component.scss'
})
export class AdminTrainerVerificationComponent implements OnInit {
  trainers$: Observable<Trainer[]>;
  loading$: Observable<boolean>;
  selectedTrainer: any = null;
showRejectionModal = false;
rejectionReason = '';
rejectionReasons: string[] = [
  'Certificate is not proper',
  'Insufficient experience',
  'Incomplete profile',
  'Invalid identification document',
  'Fake or unverifiable information',
  'Poor documentation quality',
];

selectedRejectionReason: string = '';

  // error$: Observable<string | null>;

  constructor(private store: Store) {
    this.trainers$ = this.store.select(TrainerSelectors.selectUnverifiedTrainers);
    this.loading$ = this.store.select(TrainerSelectors.selectTrainersLoading);
    //  this.error$ = this.store.select(TrainerSelectors);
  }

  ngOnInit(): void {
    this.loadTrainers();
  }

  loadTrainers(): void {
    this.store.dispatch(TrainerActions.loadUnverifiedTrainers({ query: {} }));
  }

  onVerifyTrainer(trainerId: string): void {
    // TODO: Implement verification action
    console.log('Verify trainer:', trainerId);
  }

  onRejectTrainer(trainerId: string): void {
    // TODO: Implement rejection action
    console.log('Reject trainer:', trainerId);
  }

  openDetails(trainer: any) {
    this.selectedTrainer = trainer;
  }
  
  closeDetails() {
    this.selectedTrainer = null;
    this.rejectionReason = '';
    this.showRejectionModal = false;
  }
  
  acceptTrainer(trainerId: string) {
  this.store.dispatch(TrainerActions.acceptTrainer({ trainerId }));
  }

 
  
  openRejectionModal(trainer?: Trainer) {
    this.showRejectionModal = true;
  }
  
  closeRejectionModal() {
    this.showRejectionModal = false;
    this.rejectionReason = '';
  }

  submitRejection() {
    if (this.selectedTrainer && this.selectedRejectionReason) {
      this.store.dispatch(
        TrainerActions.rejectTrainer({
          trainerId: this.selectedTrainer._id,
          reason: this.selectedRejectionReason,
        })
      );
    }
  
    this.closeDetails();
  }
}
