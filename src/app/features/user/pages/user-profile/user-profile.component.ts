import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../store/app.state';
import { map, Observable } from 'rxjs';
import { AuthenticatedUser, updateCurrentUser } from '../../../auth/store/actions/auth.actions';
import { selectCurrentUser } from '../../../auth/store/selectors/auth.selectors';
import { UserService } from '../../services/user.service';
import { isUser } from '../../../../core/guards/user-type-guards';
import { HttpClient } from '@angular/common/http';
import { NotyService } from '../../../../core/services/noty.service';
import { User } from '../../../admin/services/admin.service';
import { minimumAgeValidator } from '../../../../core/validators/dob.validator';

@Component({
  selector: 'app-user-profile',
  imports: [ CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent implements OnInit {
  private store = inject(Store<AppState>);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private http = inject(HttpClient);
  private notify = inject(NotyService);

  $currentUser!: Observable<AuthenticatedUser | null>;
  profileForm!: FormGroup;
  isLoading = false;
  originalFormValues: any = {}; // Store original values to detect changes

  readonly S3_BASE_URL =
    'https://vortexfit-app-upload.s3.ap-south-1.amazonaws.com/';
  imagePreviewUrl?: string;

  // Form options
  heightUnits = ['cm'];
  weightUnits = ['kg'];
  fitnessLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  fitnessGoals = [
    'Weight Loss',
    'Muscle Gain',
    'Strength Training',
    'Endurance',
    'Flexibility',
    'General Fitness',
  ];
  trainingTypes = [
    'Cardio',
    'Strength Training',
    'Yoga',
    'Pilates',
    'HIIT',
    'CrossFit',
    'Swimming',
    'Running',
    'Cycling',
  ];
  preferredTimes = [
    'Early Morning (5-8 AM)',
    'Morning (8-12 PM)',
    'Afternoon (12-5 PM)',
    'Evening (5-8 PM)',
    'Night (8-11 PM)',
  ];
  equipments = [
    'Dumbbells',
    'Barbells',
    'Resistance Bands',
    'Kettlebells',
    'Pull-up Bar',
    'Yoga Mat',
    'Treadmill',
    'Stationary Bike',
    'Rowing Machine',
    'Medicine Ball',
  ];

  ngOnInit(): void {
    this.$currentUser = this.store
      .select(selectCurrentUser)
      .pipe(map((user) => (isUser(user) ? { ...user } : null)));

    this.initializeForm();

    // Subscribe to current user and populate form
    this.$currentUser.subscribe((user) => {
      if (user) {
        if(isUser(user)){
          this.populateForm(user)
        }
      }
    });
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      image: [null],
      name: ['', [Validators.required, Validators.minLength(2),  Validators.pattern(/^[a-zA-Z][a-zA-Z\s\-_']*$/
)]],
      email: [{ value: '', disabled: true }], // Email is not editable
      dob: ['', [minimumAgeValidator(18)]],
      height: [
        '',
        [Validators.required, Validators.min(50), Validators.max(300)],
      ],
      heightUnit: ['cm', Validators.required],
      weight: [
        '',
        [Validators.required, Validators.min(20), Validators.max(500)],
      ],
      weightUnit: ['kg', Validators.required],
      fitnessLevel: ['', Validators.required],
      fitnessGoals: [[], Validators.required],
      trainingTypes: [[], Validators.required],
      preferredTime: ['', Validators.required],
      equipments: [[]],
    });
  }

private populateForm(user: User): void {
  const formattedDob = user.dob
    ? new Date(user.dob).toISOString().split('T')[0]
    : '';

  const formValues = {
    image: user.image || null,
    name: user.name || '',
    email: user.email || '',
    dob: formattedDob,
    height: user.height || '',
    heightUnit: user.heightUnit || 'cm',
    weight: user.weight || '',
    weightUnit: user.weightUnit || 'kg',
    fitnessLevel: user.fitnessLevel || '',
    fitnessGoals: user.fitnessGoals || [],
    trainingTypes: user.trainingTypes || [],
    preferredTime: user.preferredTime || '',
    equipments: user.equipments || [],
  };

  this.profileForm.patchValue(formValues);

  if (user.image) {
    this.imagePreviewUrl = user.image;
  }

  this.originalFormValues = { ...formValues };
}


  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];

  
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const contentType = file.type;
    const fileName = file.name;


    this.isLoading = true;

    this.userService
      .getSignedUploadUrl(fileName, contentType, 'image')
      .subscribe({
        next: ({ url, key }) => {
          this.http
            .put(url, file, {
              headers: { 'Content-Type': contentType },
            })
            .subscribe({
              next: () => {
                const fullUrl = `${this.S3_BASE_URL}${key}`;
                console.log('Image uploaded successfully:', fullUrl);

                // Update form and preview
                this.profileForm.patchValue({ image: fullUrl });
                this.profileForm.get('image')?.markAsDirty();
                this.imagePreviewUrl = fullUrl;
                this.isLoading = false;
              },
              error: (err) => {
                console.error('Upload to S3 failed', err);
                alert('Failed to upload image. Please try again.');
                this.isLoading = false;
              },
            });
        },
        error: (err) => {
          console.error('Failed to get signed URL', err);
          alert('Failed to prepare image upload. Please try again.');
          this.isLoading = false;
        },
      });
  }

onGoalToggle(goal: string): void {
  const control = this.profileForm.get('fitnessGoals');
  const goals = control?.value || [];

  const updatedGoals = goals.includes(goal)
    ? goals.filter((g: string) => g !== goal)
    : [...goals, goal];

  control?.setValue(updatedGoals);
  control?.markAsDirty();
}

onTrainingTypeToggle(type: string): void {
  const control = this.profileForm.get('trainingTypes');
  const types = control?.value || [];

  const updatedTypes = types.includes(type)
    ? types.filter((t: string) => t !== type)
    : [...types, type];

  control?.setValue(updatedTypes);
  control?.markAsDirty();
}


onEquipmentToggle(equipment: string): void {
  const control = this.profileForm.get('equipments');
  const equipments = control?.value || [];

  const updatedEquipments = equipments.includes(equipment)
    ? equipments.filter((e: string) => e !== equipment)
    : [...equipments, equipment];

  control?.setValue(updatedEquipments);
  control?.markAsDirty();
}


  isGoalSelected(goal: string): boolean {
    return this.profileForm.get('fitnessGoals')?.value?.includes(goal) || false;
  }

  isTrainingTypeSelected(type: string): boolean {
    return (
      this.profileForm.get('trainingTypes')?.value?.includes(type) || false
    );
  }

  isEquipmentSelected(equipment: string): boolean {
    return (
      this.profileForm.get('equipments')?.value?.includes(equipment) || false
    );
  }

  getFieldError(fieldName: string): string | null {
    const field = this.profileForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['min']) return `${fieldName} value is too low`;
      if (field.errors['max']) return `${fieldName} value is too high`;
    }
    return null;
  }

  private getChangedFields(): any {
    const currentValues = this.profileForm.getRawValue(); // getRawValue includes disabled fields
    const changedFields: any = {};

    Object.keys(currentValues).forEach((key) => {
      if (key === 'email') return; // Skip email as it's not editable

      const currentValue = currentValues[key];
      const originalValue = this.originalFormValues[key];

      // Handle arrays (fitness goals, training types, equipments)
      if (Array.isArray(currentValue) && Array.isArray(originalValue)) {
   if (
  JSON.stringify([...currentValue].sort()) !==
  JSON.stringify([...originalValue].sort())
) {
  changedFields[key] = currentValue;
}

      }
      // Handle other fields including image
      else if (
        currentValue !== originalValue &&
        currentValue !== null &&
        currentValue !== ''
      ) {
        changedFields[key] = currentValue;
      }
    });

    return changedFields;
  }

  hasChanges(): boolean {
    const changedFields = this.getChangedFields();
    return Object.keys(changedFields).length > 0;
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const changedFields: Record<string, unknown> = {};

      // Check if there are any changes

      this.isLoading = true;
      console.log('Updating profile with changes:', changedFields);

      // Create FormData with only changed fields
      const formData = new FormData();


      Object.keys(this.profileForm.controls).forEach((key) => {
        const control = this.profileForm.get(key);
        if (control?.dirty) {
          changedFields[key] = control.value;
        }
      });

      if (Object.keys(changedFields).length === 0) {
        this.notify.showInfo('No changes to update');
        return;
      }

      // // Call the API endpoint using your userService
      this.userService.updateProfile(changedFields).subscribe({
        next: (response: User) => {
          this.store.dispatch(updateCurrentUser({user: response}))
          this.isLoading = false;

          // Update original values with the new ones
       this.originalFormValues = structuredClone(this.profileForm.getRawValue());


          // Optional: Show success message
         this.notify.showSuccess('Profile updated successfully.')

          // Optional: Update the store with new user data if response contains updated user
          // if (response.user) {
          //   this.store.dispatch(updateUserProfile({ user: response.user }));
          // }
        },
        error: (error) => {
          console.error('Error updating profile', error);
          this.isLoading = false;

          // Show user-friendly error message
          if (error.status === 400) {
            this.notify.showError('Invalid data provided. Please check your inputs.');
          } else if (error.status === 413) {
             this.notify.showError('File size too large. Please choose a smaller image.');
          } else {
             this.notify.showError('Failed to update profile. Please try again.');
          }
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.profileForm.controls).forEach((key) => {
        this.profileForm.get(key)?.markAsTouched();
      });

      // Scroll to first error
      const firstErrorField = Object.keys(this.profileForm.controls).find(
        (key) => this.profileForm.get(key)?.invalid
      );

      if (firstErrorField) {
        const element = document.querySelector(
          `[formControlName="${firstErrorField}"]`
        ) as HTMLElement;
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
}
