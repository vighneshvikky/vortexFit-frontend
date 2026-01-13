import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotyService } from '../../../core/services/noty.service';

@Component({
  selector: 'app-recovery-codes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4"
    >
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div class="text-green-500 text-5xl mb-4">✓</div>
          <h2 class="text-3xl font-extrabold text-gray-900">
            MFA Enabled Successfully!
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Save these recovery codes in a safe place
          </p>
        </div>

        <div class="bg-white py-8 px-4 shadow rounded-lg">
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p class="text-sm text-yellow-700">
              <strong>Important:</strong> These codes can only be used once and
              won't be shown again.
            </p>
          </div>

          <div class="bg-gray-50 rounded-lg p-4 border-2 mb-6">
            <div class="grid grid-cols-2 gap-2">
              <div
                *ngFor="let code of recoveryCodes"
                class="font-mono text-sm bg-white p-2 rounded text-center"
              >
                {{ code }}
              </div>
            </div>
          </div>

          <div class="flex space-x-3 mb-6">
            <button
              (click)="copyAllCodes()"
              class="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
            >
              📋 Copy All
            </button>
            <button
              (click)="downloadCodes()"
              class="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
            >
              ⬇️ Download
            </button>
          </div>

          <label class="flex items-center mb-4">
            <input
              type="checkbox"
              [(ngModel)]="hasConfirmed"
              class="h-4 w-4 text-indigo-600 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">
              I have saved these recovery codes
            </span>
          </label>

          <button
            [disabled]="!hasConfirmed"
            (click)="continueToDashboard()"
            class="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
          >
            Continue to Login
          </button>
        </div>
      </div>
    </div>
  `,
})
export class RecoveryCodesComponent implements OnInit {
  recoveryCodes: string[] = [];
  hasConfirmed = false;
  role!: string;
  provider!: string;

  constructor(
    private router: Router,
    private notyService: NotyService,
    private route: ActivatedRoute
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.recoveryCodes = navigation?.extras?.state?.['recoveryCodes'] || [];
  }

  ngOnInit() {
    this.role = this.route.snapshot.queryParams['role'];
    this.provider = this.route.snapshot.queryParams['provider'] || 'local';

    if (this.recoveryCodes.length === 0) {
      this.router.navigate(['/auth/login'], {
        queryParams: { role: this.role },
      });
    }
  }

  copyAllCodes() {
    const codesText = this.recoveryCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    this.notyService.showSuccess('All codes copied!');
  }

  downloadCodes() {
    const codesText = this.recoveryCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recovery-codes.txt';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  continueToDashboard() {
    const message =
      this.provider === 'google'
        ? 'MFA setup complete! Please login with Google again.'
        : 'MFA setup complete! Please login with your credentials.';
    this.notyService.showSuccess(message);
    this.router.navigate(['/auth/login'], { queryParams: { role: this.role } });
  }
}
