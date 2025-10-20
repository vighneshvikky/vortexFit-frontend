import { Component, HostListener, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { TrainerService } from '../../services/trainer.service';
import { map, Observable, take } from 'rxjs';
import { updateCurrentUser } from '../../../auth/store/actions/auth.actions';
import { selectCurrentUser } from '../../../auth/store/selectors/auth.selectors';
import { CommonModule } from '@angular/common';
import { isTrainer } from '../../../../core/guards/user-type-guards';
import { Trainer } from '../../models/trainer.interface';
import { NotyService } from '../../../../core/services/noty.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  CATEGORIES,
  CATEGORY_TO_SPECIALIZATIONS,
} from '../../../../shared/constants/filter-options';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-trainer-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trainer-profile.component.html',
  styleUrl: './trainer-profile.component.scss',
})
export class TrainerProfileComponent implements OnInit {
  profileForm!: FormGroup;
  currentTrainer$!: Observable<Trainer | null>;
  showEditModal = false;
  showCertificateModal = false;

  categories = CATEGORIES;

  categoryToSpecializations: { [key: string]: string[] } =
    CATEGORY_TO_SPECIALIZATIONS;

  availableSpecializations: string[] = [];

  private fb = inject(FormBuilder);
  private store = inject(Store);
  private trainerService = inject(TrainerService);
  private notify = inject(NotyService);
  private router = inject(Router);
  private http = inject(HttpClient);

  readonly S3_BASE_URL = environment.S3_BASE_URL;
  certPreviewUrl?: string;
  imagePreviewUrl?: string;
  showSpecializationError = false;

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: [
        '',
        [
          Validators.pattern(/^[a-zA-Z][a-zA-Z\s\-_']*$/),
          Validators.minLength(2),
          Validators.maxLength(25),
        ],
      ],
      phoneNumber: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      experience: ['', [Validators.min(0), Validators.max(100)]],
      bio: [''],
      oneToOneSessionPrice: ['', [Validators.min(0), Validators.max(100000)]],
      workoutPlanPrice: ['', [Validators.min(0), Validators.max(100000)]],
      image: [''],
      category: ['', []],
      // Changed from array to string and added required validator
      specialization: ['', [Validators.required]],
      certification: [null, []],
      idProof: [null, []],
    });

    this.currentTrainer$ = this.store.select(selectCurrentUser).pipe(
      map((user) =>
        isTrainer(user)
          ? {
              ...user,
              certification: this.formatKey(user.certificationUrl),
            }
          : null
      )
    );

    this.currentTrainer$.pipe(take(1)).subscribe((trainer) => {
      if (trainer) {
        console.log('trainer', trainer);
        this.availableSpecializations = this.categoryToSpecializations[trainer.category] || [];
        this.certPreviewUrl = this.formatKey(trainer.certificationUrl);
        this.imagePreviewUrl = trainer.image;
        this.profileForm.patchValue({
          ...trainer,
          oneToOneSessionPrice: trainer.pricing?.oneToOneSession ?? '',
          workoutPlanPrice: trainer.pricing?.workoutPlan ?? '',
          // Handle both array and string specialization
          specialization: Array.isArray(trainer.specialization) 
            ? trainer.specialization[0] || '' 
            : trainer.specialization || '',
        });
      }
    });

    // Listen to category changes and update specializations
    this.profileForm
      .get('category')
      ?.valueChanges.subscribe((selectedCategory) => {
        this.availableSpecializations =
          this.categoryToSpecializations[selectedCategory] || [];
        
        // Reset specialization when category changes
        this.profileForm.patchValue({ specialization: '' }, { emitEvent: false });
        
        // Mark as touched to show validation error if needed
        this.profileForm.get('specialization')?.markAsTouched();
      });
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/default-user.png';
  }

  onFileSelect(event: Event, field: string) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const contentType = file.type;
    const fileName = file.name;

    this.trainerService
      .getSignedUploadUrl(fileName, contentType, field)
      .subscribe({
        next: ({ url, key }) => {
          this.http
            .put(url, file, {
              headers: { 'Content-Type': contentType },
            })
            .subscribe({
              next: () => {
                const fullUrl = `${environment.S3_BASE_URL}${key}`;
                this.profileForm.patchValue({ [field]: fullUrl });
                this.profileForm.get(field)?.markAsDirty();

                if (field === 'image') this.imagePreviewUrl = fullUrl;
                if (field === 'certification') this.certPreviewUrl = fullUrl;
              },
              error: (err) => console.error('Upload to S3 failed', err),
            });
        },
        error: (err) => console.error('Failed to get signed URL', err),
      });
  }

  private formatKey(key?: string | null): string | undefined {
    return key
      ? this.S3_BASE_URL + encodeURIComponent(key).replace(/%2F/g, '/')
      : undefined;
  }

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.profileForm.markAllAsTouched();

    if (this.profileForm.invalid) {
      console.log('Form is invalid. Listing all errors:');
      Object.keys(this.profileForm.controls).forEach((key) => {
        const control = this.profileForm.get(key);
        if (control && control.invalid) {
          console.log(`${key} has errors:`, control.errors);
        }
      });
      
      // Show specific error for specialization
      if (this.profileForm.get('specialization')?.invalid) {
        this.notify.showError('Please select a specialization');
      } else {
        this.notify.showError('Please fix all validation errors');
      }
      return;
    }

    const changedFields: Record<string, unknown> = {};

    Object.keys(this.profileForm.controls).forEach((key) => {
      const control = this.profileForm.get(key);
      if (control?.dirty) {
        changedFields[key] = control.value;
      }
    });

    if (
      this.profileForm.get('oneToOneSessionPrice')?.dirty ||
      this.profileForm.get('workoutPlanPrice')?.dirty
    ) {
      changedFields['pricing'] = {
        oneToOneSession: this.profileForm.value.oneToOneSessionPrice,
        workoutPlan: this.profileForm.value.workoutPlanPrice,
      };

      delete changedFields['oneToOneSessionPrice'];
      delete changedFields['workoutPlanPrice'];
    }

    if (changedFields['certification']) {
      changedFields['certificationUrl'] = changedFields['certification'];
      delete changedFields['certification'];
    }

    if (Object.keys(changedFields).length === 0) {
      this.notify.showInfo('No changes to update');
      this.closeEditModal();
      return;
    }

    this.trainerService.updateProfile(changedFields).subscribe({
      next: (updatedTrainer: Trainer) => {
        console.log('updatedTrainer', updatedTrainer);
        this.store.dispatch(updateCurrentUser({ user: updatedTrainer }));
        this.notify.showSuccess('Profile updated successfully');
        this.closeEditModal();
      },
      error: (err) => {
        console.error(err);
        this.notify.showError('Profile update failed');
        this.closeEditModal();
      },
    });
  }

  onCategoryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const category = selectElement.value;

    this.availableSpecializations =
      this.categoryToSpecializations[category] || [];
    
    // Reset specialization when category changes
    this.profileForm.patchValue({ specialization: '' });
    
    // Mark the category as dirty since it changed
    this.profileForm.get('category')?.markAsDirty();
  }

  openEditModal() {
    this.showEditModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeEditModal() {
    this.showEditModal = false;
    document.body.style.overflow = 'auto';
    
    // Reset form to original values when closing
    this.currentTrainer$.pipe(take(1)).subscribe((trainer) => {
      if (trainer) {
        this.profileForm.patchValue({
          ...trainer,
          oneToOneSessionPrice: trainer.pricing?.oneToOneSession ?? '',
          workoutPlanPrice: trainer.pricing?.workoutPlan ?? '',
          specialization: Array.isArray(trainer.specialization) 
            ? trainer.specialization[0] || '' 
            : trainer.specialization || '',
        });
        
        // Reset dirty state
        this.profileForm.markAsPristine();
        this.profileForm.markAsUntouched();
      }
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey() {
    if (this.showEditModal) {
      this.closeEditModal();
    }
    if (this.showCertificateModal) {
      this.closeCertificateModal();
    }
  }

  openCertificateModal() {
    this.showCertificateModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeCertificateModal() {
    this.showCertificateModal = false;
    document.body.style.overflow = 'auto';
  }

  downloadCertificate() {
    if (this.certPreviewUrl) {
      const link = document.createElement('a');
      link.href = this.certPreviewUrl;
      link.download = 'certificate.jpg';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  openCertificateInNewTab() {
    if (this.certPreviewUrl) {
      window.open(this.certPreviewUrl, '_blank');
    }
  }
}