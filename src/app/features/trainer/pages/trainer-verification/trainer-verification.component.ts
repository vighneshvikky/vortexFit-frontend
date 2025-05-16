import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { TrainerService } from '../../services/trainer.service';
import { Observable, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectTrainerId } from '../../../auth/store/selectors/auth.selectors';

@Component({
  selector: 'app-trainer-verification',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './trainer-verification.component.html',
  styleUrl: './trainer-verification.component.scss',
})
export class TrainerVerificationComponent implements OnInit{
  form!: FormGroup;
  trainerId$!: Observable<string | null>;


  idProofFile?: File;
  certificationFile?: File;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private trainerService: TrainerService,
    private store: Store
  ) {

}

ngOnInit(): void {
  this.trainerId$ = this.store.select(selectTrainerId);

   this.form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', Validators.required],
    specialization: ['', Validators.required],
    experience: [0, [Validators.required, Validators.min(0)]],
    bio: [''],
    idProof: [null, Validators.required],     
    certification: [null],                          
  });
}

  onFileSelected(event: Event, field: 'idProof' | 'certification'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (field === 'idProof') {
        this.idProofFile = input.files[0];
        this.form.patchValue({ idProof: this.idProofFile.name });
      } else if (field === 'certification') {
        this.certificationFile = input.files[0];
        this.form.patchValue({ certification: this.certificationFile.name });
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.idProofFile) {
      alert('ID Proof file is required.');
      return;
    }

    this.trainerId$.pipe(take(1)).subscribe(trainerId => {
      if (!trainerId) {
        alert('Trainer ID not found. Please login again.');
        return;
      }

      const formData = new FormData();
      formData.append('name', this.form.value.name);
      formData.append('email', this.form.value.email);
      formData.append('phoneNumber', this.form.value.phoneNumber);
      formData.append('specialization', this.form.value.specialization);
      formData.append('experience', this.form.value.experience.toString());
      formData.append('bio', this.form.value.bio || '');

      formData.append('idProof', this.idProofFile!);

      if (this.certificationFile) {
        formData.append('certification', this.certificationFile);
      }

      this.trainerService.updateProfile(trainerId, formData).subscribe({
        next: updatedTrainer => {
          alert('Profile updated successfully!');
         
        },
        error: err => {
          alert('Error updating profile: ' + err.message);
        }
      });
    });
  }

}
