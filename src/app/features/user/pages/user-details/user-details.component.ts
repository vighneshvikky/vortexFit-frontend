import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
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

@Component({
  selector: 'app-user-details',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser$!: Observable<AuthenticatedUser | null>;
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
      dob: ['', Validators.required],
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
      fitnessGoals: [[], Validators.required],
      trainingTypes: [[], Validators.required],
      preferredTime: ['flexible', Validators.required],
      equipments: [[], Validators.required],
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

  onCheckboxChange(event: any, controlName: string) {
    const control = this.profileForm.get(controlName);
    if (!control) return;

    const current = control.value as string[];
    if (event.target.checked) {
      control.setValue([...current, event.target.value]);
    } else {
      control.setValue(current.filter((val) => val !== event.target.value));
    }
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
}
