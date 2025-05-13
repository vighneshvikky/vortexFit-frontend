import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { NotyService } from '../../../../core/services/noty.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  loginError: string | null = null;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router,
    private notyService: NotyService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.loginError = null;

      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.adminService.login(credentials).subscribe({
        next: () => {
          this.notyService.showSuccess('Login successful');
          this.isSubmitting = false;
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          this.isSubmitting = false;
          const errorMessage = error.error?.message || 'Login failed. Please try again.';
          this.loginError = errorMessage;
          this.notyService.showError(errorMessage);
        }
      });
    }
  }
} 