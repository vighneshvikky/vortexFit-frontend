import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotyService } from '../../../core/services/noty.service';

@Component({
  selector: 'app-mfa-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4"
    >
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="text-center text-3xl font-extrabold text-gray-900">
            MFA Setup Required
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Secure your account with Two-Factor Authentication
          </p>
        </div>

        <div *ngIf="loading && !qrCode" class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"
          ></div>
        </div>

        <div
          *ngIf="qrCode && !showOtpForm"
          class="bg-white py-8 px-4 shadow rounded-lg"
        >
          <div class="space-y-6">
            <div class="text-center">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                Scan QR Code
              </h3>
              <img
                [src]="qrCode"
                alt="QR Code"
                class="mx-auto border-2 rounded-lg"
              />
              <p class="text-sm text-gray-600 mt-4">
                Use Google Authenticator or Authy
              </p>
            </div>

            <button
              (click)="showOtpForm = true"
              class="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Continue
            </button>
          </div>
        </div>

        <div *ngIf="showOtpForm" class="bg-white py-8 px-4 shadow rounded-lg">
          <form [formGroup]="otpForm" (ngSubmit)="onVerifyOtp()">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">
                Enter 6-digit code
              </label>
              <input
                type="text"
                formControlName="otp"
                maxlength="6"
                placeholder="000000"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <button
              type="submit"
              [disabled]="otpForm.invalid || loading"
              class="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {{ loading ? 'Verifying...' : 'Verify & Enable MFA' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class MfaSetupComponent implements OnInit {
  userId!: string;
  role!: string;
  provider!: string; 
  qrCode: string | null = null;
  manualKey: string | null = null;
  showOtpForm = false;
  loading = false;
  otpForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private notyService: NotyService
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
  }

  ngOnInit() {
    this.userId = this.route.snapshot.queryParams['userId'];
    this.role = this.route.snapshot.queryParams['role'];
    this.provider = this.route.snapshot.queryParams['provider'] || 'local'; // ✅ Get provider

    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadQrCode();
  }

  loadQrCode() {
    this.loading = true;
    this.authService.setupMfa(this.userId, this.role).subscribe({
      next: (response) => {
        if (!response) {
          this.notyService.showError('Failed to setup MFA');
          return;
        }
        this.qrCode = response.qrCode;
        this.manualKey = response.manualKey;
        this.loading = false;
      },
      error: (error) => {
        this.notyService.showError(error.error?.message || 'MFA setup failed');
        this.loading = false;
      },
    });
  }

  copyKey() {
    if (this.manualKey) {
      navigator.clipboard.writeText(this.manualKey);
      this.notyService.showSuccess('Key copied!');
    }
  }

  onVerifyOtp() {
    if (this.otpForm.invalid) return;

    const otp = this.otpForm.value.otp;
    this.loading = true;

    this.authService.verifyMfaSetup(this.userId, otp, this.role).subscribe({
      next: (response) => {
        this.notyService.showSuccess(
          'MFA setup completed. Re-login required to verify MFA.'
        );

        this.router.navigate(['/auth/login'], {
          queryParams: {
            role: this.role,
            provider: this.provider,
          },
        });
      },
      error: (error) => {
        this.notyService.showError(error.error?.message || 'Invalid OTP');
        this.loading = false;
      },
    });
  }
}
