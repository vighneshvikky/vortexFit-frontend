import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { AuthService } from '../../../../core/services/auth.service';
import { NotyService } from '../../../../core/services/noty.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  role: 'user' | 'trainer' = 'user';
  isLoading = false;
  isEmailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notyService: NotyService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.role = params['role'] || 'user';
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      const { email } = this.forgotPasswordForm.value;

      this.authService.forgotPassword(email, this.role).subscribe({
        next: () => {
          this.isLoading = false;
          this.isEmailSent = true;
          this.notyService.showSuccess('Password reset instructions have been sent to your email.');
        },
        error: (error) => {
          this.isLoading = false;
          this.notyService.showError(error?.error?.message || 'Failed to process request. Please try again.');
        }
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }
}
