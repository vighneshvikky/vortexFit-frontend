import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, take, tap, map } from 'rxjs';
import { TrainerService } from '../../services/trainer.service';
import { NotyService } from '../../../../core/services/noty.service';
import { Router } from '@angular/router';
import { selectCurrentUser } from '../../../auth/store/selectors/auth.selectors';

@Component({
  selector: 'app-trainer-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './trainer-verification.component.html',
  styleUrl: './trainer-verification.component.scss',
})
export class TrainerVerificationComponent implements OnInit {
  @ViewChild('certificateInput') certificateInput!: ElementRef;
  @ViewChild('idProofInput') idProofInput!: ElementRef;

  verificationForm: FormGroup;
  currentUser$: Observable<any>;
  trainerId: string | null = null;
  isLoading = false;
  specializations = [
    { value: 'cardio', label: 'Cardio' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'martial_arts', label: 'Martial Arts' },
    { value: 'fitness', label: 'Fitness' },
  ];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private trainerService: TrainerService,
    private notyService: NotyService,
    private router: Router
  ) {
    this.verificationForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z\s]*$/),
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      ],
      experience: [
        '',
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      bio: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(10),
          this.minWords(2),
        ],
      ],
      specialization: ['', [Validators.required]],
      certification: [null, [Validators.required]],
      idProof: [null, [Validators.required]],
    });

    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    this.currentUser$
      .pipe(
        tap((user) => {
          if (user) {
            this.trainerId = user._id;
            console.log('trainerId', this.trainerId);
            this.verificationForm.patchValue({
              name: user.name || '',
              email: user.email || '',
            });
          }
        })
      )
      .subscribe();

      
  }

  private minWords(min: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const words = control.value.trim().split(/\s+/);
      return words.length >= min
        ? null
        : { minWords: { required: min, actual: words.length } };
    };
  }

  onFileSelected(event: Event, type: 'certification' | 'idProof'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.notyService.showError('File size should be less than 5MB');
        return;
      }
      this.verificationForm.patchValue({
        [type]: file,
      });
    }
  }

  triggerFileInput(type: 'certification' | 'idProof'): void {
    if (type === 'certification') {
      this.certificateInput.nativeElement.click();
    } else {
      this.idProofInput.nativeElement.click();
    }
  }

  onSubmit(): void {
    if (this.verificationForm.valid && this.trainerId) {
      this.isLoading = true;
      const formData = new FormData();

      Object.keys(this.verificationForm.value).forEach((key) => {
        formData.append(key, this.verificationForm.value[key]);
      });

      this.trainerService.updateProfile(this.trainerId, formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notyService.showSuccess(
            'Verification request submitted successfully'
          );
          this.router.navigate(['/trainer/trainer-status']);
        },
        error: (error) => {
          this.isLoading = false;
          this.notyService.showError(
            error?.error?.message || 'Failed to submit verification request'
          );
        },
      });
    } else {
      if (!this.trainerId) {
        this.notyService.showError(
          'Trainer ID not found. Please try logging in again.'
        );
      }
      this.verificationForm.markAllAsTouched();
    }
  }

  get name() {
    return this.verificationForm.get('name');
  }
  get email() {
    return this.verificationForm.get('email');
  }
  get phoneNumber() {
    return this.verificationForm.get('phoneNumber');
  }
  get experience() {
    return this.verificationForm.get('experience');
  }
  get bio() {
    return this.verificationForm.get('bio');
  }
  get specialization() {
    return this.verificationForm.get('specialization');
  }
  get certification() {
    return this.verificationForm.get('certification');
  }
  get idProof() {
    return this.verificationForm.get('idProof');
  }
}
