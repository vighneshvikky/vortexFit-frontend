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
  import {
    AuthenticatedUser,
    updateCurrentUser,
  } from '../../../auth/store/actions/auth.actions';
  import { selectCurrentUser } from '../../../auth/store/selectors/auth.selectors';
  import { CommonModule } from '@angular/common';
  import { isTrainer, isUser } from '../../../../core/guards/user-type-guards';
  import { Trainer } from '../../models/trainer.interface';
  import { NotyService } from '../../../../core/services/noty.service';
  import { Router } from '@angular/router';
  import { HttpClient } from '@angular/common/http';
import { CATEGORIES, CATEGORY_TO_SPECIALIZATIONS } from '../../../../shared/constants/filter-options';

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

    categories = CATEGORIES

    categoryToSpecializations: { [key: string]: string[] } = CATEGORY_TO_SPECIALIZATIONS

    availableSpecializations: string[] = [];


    private fb = inject(FormBuilder);
    private store = inject(Store);
    private trainerService = inject(TrainerService);
    private notify = inject(NotyService);
    private router = inject(Router);
    private http = inject(HttpClient);

    readonly S3_BASE_URL =
      'https://vortexfit-app-upload.s3.ap-south-1.amazonaws.com/';
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
        bio: ['', [Validators.minLength(1), Validators.maxLength(100)]],
        oneToOneSessionPrice: ['', [Validators.min(0), Validators.max(100000)]],
        workoutPlanPrice: ['', [Validators.min(0), Validators.max(100000)]],
        image: [''],
        category: ['', []],
        specialization: [[], []],
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
          this.certPreviewUrl = this.formatKey(trainer.certificationUrl);
          this.imagePreviewUrl = trainer.image;
          this.profileForm.patchValue({
            ...trainer,
            oneToOneSessionPrice: trainer.pricing?.oneToOneSession ?? '',
            workoutPlanPrice: trainer.pricing?.workoutPlan ?? '',
          });
        }
      });


          this.profileForm
        .get('category')
        ?.valueChanges.subscribe((selectedCategory) => {
          this.availableSpecializations =
            this.categoryToSpecializations[selectedCategory] || [];
          this.profileForm.get('specializations')?.setValue([]);
        });
    }
  // onCategoryChange(category: string) {
  //   this.availableSpecializations = this.categoryToSpecializations[category] || [];
  //   this.profileForm.get('specialization')?.setValue(''); 
  // }
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
                  const fullUrl = `https://vortexfit-app-upload.s3.ap-south-1.amazonaws.com/${key}`;
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
 if (this.profileForm.invalid) {
  console.log('Form is invalid. Listing all errors:');
  Object.keys(this.profileForm.controls).forEach((key) => {
    const control = this.profileForm.get(key);
    if (control && control.invalid) {
      console.log(`${key} has errors:`, control.errors);
    }
  });
  this.profileForm.markAllAsTouched();
  return;
}

 if (this.profileForm.invalid) {

    this.profileForm.markAllAsTouched(); 
    return;
  }

      if (this.profileForm.invalid) {
        console.log('Form is invalid, returning');
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
        return;
      }

     

      this.trainerService.updateProfile(changedFields).subscribe({
        next: (updatedTrainer: Trainer) => {
          console.log('updatedTrainer', updatedTrainer);
          this.store.dispatch(updateCurrentUser({ user: updatedTrainer }));
          this.notify.showSuccess('Profile updated successfully');
          this.router.navigate(['/trainer/profile']);
        },
        error: (err) => {
          console.error(err);
          this.notify.showError('Profile update failed');
          this.router.navigate(['/trainer/profile']);
        },
      });
    }
    
onCategoryChange(event: Event): void {
  const selectElement = event.target as HTMLSelectElement;
  const category = selectElement.value;

  this.availableSpecializations = this.categoryToSpecializations[category] || [];
  this.profileForm.get('specialization')?.setValue('');
  // this.showSpecializationError = true;
}

    

    openEditModal() {
      this.showEditModal = true;
      document.body.style.overflow = 'hidden';
    }

    closeEditModal() {
      this.showEditModal = false;
      document.body.style.overflow = 'auto';
    }

    @HostListener('document:keydown.escape', ['$event'])
    onEscapeKey(event: KeyboardEvent) {
      if (this.showEditModal) {
        this.closeEditModal();
      }
    }
  }
