import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../../../store/app.state';
import { Trainer } from '../../models/trainer.interface';
import { selectTrainerStatus } from '../../../auth/store/selectors/auth.selectors';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trainer-status',
  standalone: true,
  templateUrl: './trainer-status.component.html',
  styleUrls: ['./trainer-status.component.scss'],
  imports: [CommonModule]
})
export class TrainerStatusComponent implements OnInit {
  trainer$: Observable<Trainer | null>;

  constructor(
    private store: Store<AppState>,
    private router: Router
  ) {
    this.trainer$ = this.store.select(selectTrainerStatus);
  }

  ngOnInit(): void {}

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      case 'rejected':
        return 'text-danger';
      default:
        return 'text-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Submitted';
    }
  }

  navigateToDashboard(): void {
    this.router.navigate(['/trainer/dashboard']);
  }

  resubmitForm(): void {
    this.router.navigate(['/trainer/verification']);
  }
}
