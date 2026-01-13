import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { NotyService } from '../../../../core/services/noty.service';
import { Store } from '@ngrx/store';
import { loginSuccess } from '../../../auth/store/actions/auth.actions';
import { Subject } from 'rxjs';
import { AppState } from '../../../../store/app.state';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  loginForm: FormGroup;
  isSubmitting = false;
  loginError: string | null = null;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private adminService: AdminService,
    private router: Router,
    private notyService: NotyService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isSubmitting = true;
    this.loginError = null;
    
    const { email, password } = this.loginForm.value;

    // Admin login - no MFA required
    this.adminService.login({ email, password }).subscribe({
      next: (response) => {
        // Create admin user object
        const admin = {
          _id: response.data._id,
          email: response.data.email,
          role: 'admin' as const,
        };

        // Dispatch loginSuccess to store
        this.store.dispatch(loginSuccess({ user: admin }));
        
        this.notyService.showSuccess('Login successful');
        this.isSubmitting = false;
        
        // Navigation will be handled by redirectAfterLogin$ effect
      },
      error: (error) => {
        this.isSubmitting = false;
        this.loginError = error.error?.message || 'Admin login failed. Please try again.';
        this.notyService.showError('Admin login failed. Please try again.');
      }
    });
  }
}