import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../store/app.state';
import { Observable, tap } from 'rxjs';
import { selectCurrentUser } from '../../../auth/store/selectors/auth.selectors';
import {
  AuthenticatedUser,
  updateCurrentUser,
} from '../../../auth/store/actions/auth.actions';
import { isUser } from '../../../../core/guards/user-type-guards';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotyService } from '../../../../core/services/noty.service';
import { minimumAgeValidator } from '../../../../core/validators/dob.validator';

@Component({
  selector: 'app-user-details',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser$!: Observable<AuthenticatedUser | null>;
  fitnessGoalOptions = [
    'fat loss',
    'muscle gain',
    'endurance',
    'general fitness',
  ];
  trainingTypeOptions = ['cardio', 'strength', 'yoga', 'crossfit'];
  equipmentOptions = ['dumbbells', 'resistance bands', 'yoga mat', 'treadmill'];
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private store: Store<AppState>,
    private router: Router,
    private notify: NotyService
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      dob: ['', Validators.required, minimumAgeValidator(18)],
      height: [
        '',
        [Validators.required, Validators.min(30), Validators.max(300)],
      ],
      heightUnit: ['cm', Validators.required],
      weight: [
        '',
        [Validators.required, Validators.min(10), Validators.max(300)],
      ],
      weightUnit: ['kg', Validators.required],
      fitnessLevel: ['', Validators.required],
      fitnessGoals: [[], [this.minArrayLengthValidator(1)]],
      trainingTypes: [[], [this.minArrayLengthValidator(1)]],
      preferredTime: ['flexible', Validators.required],
      equipments: [[]],
    });

    this.currentUser$ = this.store.select(selectCurrentUser).pipe(
      tap((user) => {
        if (user && isUser(user)) {
          this.profileForm.patchValue({
            name: user.name,
            email: user.email,
            dob: user.dob || '',
            height: user.height || '',
            heightUnit: user.heightUnit || 'cm',
            weight: user.weight || '',
            weightUnit: user.weightUnit || 'kg',
            fitnessLevel: user.fitnessLevel || '',
            fitnessGoals: user.fitnessGoals || [],
            trainingTypes: user.trainingTypes || [],
            preferredTime: user.preferredTime || 'flexible',
            equipments: user.equipments || [],
          });
        }
      })
    );

    this.currentUser$.subscribe();
  }
  private minArrayLengthValidator(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (Array.isArray(value) && value.length >= minLength) {
        return null;
      }
      return {
        minArrayLength: {
          requiredLength: minLength,
          actualLength: Array.isArray(value) ? value.length : 0,
        },
      };
    };
  }

onCheckboxChange(event: Event, controlName: string): void {
  const inputElement = event.target as HTMLInputElement;
  const control = this.profileForm.get(controlName);
  const currentValue = control?.value || [];

  if (inputElement.checked) {
    control?.setValue([...currentValue, inputElement.value]);
  } else {
    control?.setValue(
      currentValue.filter((item: string) => item !== inputElement.value)
    );
  }

  
  control?.markAsTouched();
}


  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const updatedData = this.profileForm.getRawValue();

    this.userService.updateProfile(updatedData).subscribe({
      next: (response) => {
        this.store.dispatch(updateCurrentUser({ user: updatedData }));
        this.notify.showSuccess('Redirecting to Dashboard.');
        this.router.navigate(['/user/dashboard']);
        console.log('✅ Profile updated successfully!', response);
      },
      error: (err) => {
        console.error('❌ Failed to update profile', err);
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required.`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${
          field.errors['min'].min
        }.`;
      }
      if (field.errors['max']) {
        return `${this.getFieldLabel(fieldName)} must not exceed ${
          field.errors['max'].max
        }.`;
      }
      if (field.errors['minArrayLength']) {
        return `Please select at least ${field.errors['minArrayLength'].requiredLength} option(s).`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      dob: 'Date of Birth',
      height: 'Height',
      weight: 'Weight',
      fitnessLevel: 'Fitness Level',
      fitnessGoals: 'Fitness Goals',
      trainingTypes: 'Training Types',
    };
    return labels[fieldName] || fieldName;
  }
}
