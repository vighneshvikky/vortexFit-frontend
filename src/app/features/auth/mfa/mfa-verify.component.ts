import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Store } from '@ngrx/store';
import { NotyService } from '../../../core/services/noty.service';
import { loginSuccess } from '../store/actions/auth.actions';

@Component({
  selector: 'app-mfa-verify',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4"
    >
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="text-center text-3xl font-extrabold text-gray-900">
            Two-Factor Authentication
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <div class="bg-white py-8 px-4 shadow rounded-lg">
          <form [formGroup]="otpForm" (ngSubmit)="onVerifyOtp()">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">
                Authentication Code
              </label>
              <input
                type="text"
                formControlName="otp"
                maxlength="6"
                placeholder="000000"
                autofocus
                class="mt-1 block w-full px-3 py-2 border rounded-md text-center text-2xl tracking-widest"
                [class.border-red-500]="errorMessage"
              />
            </div>

            <div
              *ngIf="errorMessage"
              class="mb-4 p-3 bg-red-50 text-red-800 rounded-md text-sm"
            >
              {{ errorMessage }}
            </div>

            <button
              type="submit"
              [disabled]="otpForm.invalid || loading"
              class="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {{ loading ? 'Verifying...' : 'Verify' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class MfaVerifyComponent implements OnInit {
  userId!: string;
  role!: string;
  provider!: string; 
  otpForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private store: Store,
    private notyService: NotyService
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });

    this.otpForm.get('otp')?.valueChanges.subscribe((value) => {
      if (value && value.length === 6 && /^\d{6}$/.test(value)) {
        this.onVerifyOtp();
      }
    });
  }

  ngOnInit() {
    this.userId = this.route.snapshot.queryParams['userId'];
    this.role = this.route.snapshot.queryParams['role'];
    this.provider = this.route.snapshot.queryParams['provider'] || 'local'; // ✅ Get provider

    if (!this.userId) {
      this.router.navigate(['/auth/login']);
    }
  }

  onVerifyOtp() {
    if (this.otpForm.invalid || this.loading) return;

    const otp = this.otpForm.value.otp;
    this.loading = true;
    this.errorMessage = null;

    this.authService.verifyMfaLogin(this.userId, otp, this.role).subscribe({
      next: (response) => {
        this.store.dispatch(loginSuccess({ user: response.user }));
        this.notyService.showSuccess('Login successful!');
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Invalid OTP. Please try again.';
        this.loading = false;
        this.otpForm.reset();
      },
    });
  }
}
