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
import { Observable, tap } from 'rxjs';
import { TrainerService } from '../../services/trainer.service';
import { NotyService } from '../../../../core/services/noty.service';
import { Router } from '@angular/router';
import { selectCurrentUser } from '../../../auth/store/selectors/auth.selectors';
import { HttpClient } from '@angular/common/http';
import { Trainer } from '../../models/trainer.interface';
import {
  AuthenticatedUser,
  updateCurrentUser,
} from '../../../auth/store/actions/auth.actions';
import { AppState } from '../../../../store/app.state';
import {
  CATEGORIES,
  CATEGORY_TO_SPECIALIZATIONS,
} from '../../../../shared/constants/filter-options';
import { environment } from '../../../../../environments/environment';

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
  currentUser$: Observable<AuthenticatedUser | null>;
  trainerId: string | null = null;
  isLoading = false;
  uploadedFileNames: { [key in 'certification' | 'idProof']?: string } = {};
  availableSpecializations: string[] = [];
  idProofUrl: string | null = null;
  categories = CATEGORIES;

  certificationImageUrl: string | null = null;
  idProofImageUrl: string | null = null;
  showCertificationPreview = false;
  showIdProofPreview = false;

  categoryToSpecializations: { [category: string]: string[] } =
    CATEGORY_TO_SPECIALIZATIONS;

    private readonly S3_BASE_URL = environment.S3_BASE_URL;

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private trainerService: TrainerService,
    private notyService: NotyService,
    private router: Router,
    private http: HttpClient
  ) {
    this.verificationForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z][a-zA-Z\s\-_']*$/),
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
      bio: ['', [Validators.required, this.minWords(2)]],
      oneToOneSessionPrice: [
        '',
        [Validators.required, Validators.min(0), Validators.max(100000)],
      ],
      workoutPlanPrice: [
        '',
        [Validators.required, Validators.min(0), Validators.max(100000)],
      ],
      category: ['', [Validators.required]],
      specialization: [[], [Validators.required]],
      certification: [null, [Validators.required]],
      idProof: [null, [Validators.required]],
    });

    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    this.currentUser$
      .pipe(
        tap((user) => {
          if (user && 'phoneNumber' in user) {
            console.log('user spea', user.specialization);
            this.availableSpecializations =
              CATEGORY_TO_SPECIALIZATIONS[user.category];
            console.log('after special', this.availableSpecializations);
            this.verificationForm.patchValue({
              name: user.name ?? null,
              email: user.email ?? null,
              phoneNumber: user.phoneNumber ?? null,
              bio: user.bio ?? null,
              category: user.category ?? null,
              experience: user.experience ?? null,
              specialization: user.specialization ?? null,
              oneToOneSessionPrice: user.pricing.oneToOneSession,
              workoutPlanPrice: user.pricing.workoutPlan,
            });

            if(user.certificationUrl){
              this.certificationImageUrl = this.getFullImageUrl(user.certificationUrl);
            }

               if (user.idProofUrl) {
              this.idProofImageUrl = this.getFullImageUrl(user.idProofUrl);
            }
          } else if (user && 'name' in user && '_id' in user) {
            this.verificationForm.patchValue({
              name: user.name ?? null,
              email: user.email ?? null,
            });
          }
        })
      )
      .subscribe();

    this.verificationForm
      .get('category')
      ?.valueChanges.subscribe((selectedCategory) => {
        this.availableSpecializations =
          this.categoryToSpecializations[selectedCategory] || [];
        this.verificationForm.get('specialization')?.setValue([]);
      });
  }

  openIdProofPreview(): void {
    if (this.idProofImageUrl) {
      this.showIdProofPreview = true;
    }
  }

    openCertificationPreview(): void {
    if (this.certificationImageUrl) {
      this.showCertificationPreview = true;
    }
  }

  closeCertificationPreview(): void {
    this.showCertificationPreview = false;
  }


  closeIdProofPreview(): void {
    this.showIdProofPreview = false;
  }


  private getFullImageUrl(path: string): string {
    if (!path) return '';
    
   
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
   
    return `${this.S3_BASE_URL}${path}`;
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
        this.notyService.showError('File size should be less than 5mb');
        return;
      }

      this.trainerService
        .getSignedUploadUrl(file.name, file.type, type)
        .subscribe({
          next: (res) => {
            const { url, key } = res;

            this.http
              .put(url, file, {
                headers: { 'Content-Type': file.type },
              })
              .subscribe({
                next: () => {
                  this.verificationForm.patchValue({
                    [type]: key,
                  });

                  this.uploadedFileNames[type] = file.name;

                  this.notyService.showSuccess(
                    `${type} uploaded successfully.`
                  );
                },
                error: () => {
                  this.notyService.showError(`Failed to upload ${type}`);
                },
              });
          },
          error: () => {
            this.notyService.showError(`Could not get upload URL for ${type}`);
          },
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
    console.log('submitting');
    console.log('trainerId', this.trainerId);
    console.log('formValue', this.verificationForm.value);
    if (this.verificationForm.valid) {
      this.isLoading = true;
      const formValues = this.verificationForm.value;

      const profileData = {
        name: formValues.name,
        email: formValues.email,
        phoneNumber: formValues.phoneNumber,
        bio: formValues.bio,
        experience: Number(formValues.experience),
        category: formValues.category,
        specialization: formValues.specialization,
        certificationUrl: formValues.certification,
        idProofUrl: formValues.idProof,
        pricing: {
          oneToOneSession: formValues.oneToOneSessionPrice,
          workoutPlan: formValues.workoutPlanPrice,
        },
      };

      this.trainerService.updateVerificationProfile(profileData).subscribe({
        next: (res: Trainer) => {
          console.log('res from be', res);
          this.store.dispatch(updateCurrentUser({ user: res }));
          this.isLoading = false;
          this.notyService.showSuccess(
            'Verification request submitted successfully'
          );

          this.router.navigate(['/auth/trainer-status']);
        },
        error: (error) => {
          console.error('Error from backend:', error);
          this.isLoading = false;
          this.notyService.showError(
            error?.error?.message || 'Failed to submit verification request'
          );
        },
      });
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

  get category() {
    return this.verificationForm.get('category');
  }
}
