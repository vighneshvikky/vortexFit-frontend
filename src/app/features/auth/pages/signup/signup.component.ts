import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  matchPassword,
  passwordStrengthValidator,
} from '../../../../core/validators/password.validators';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NotyService } from '../../../../core/services/noty.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  isLoading = false;
  errorMessage: string | null = null;
  registerForm!: FormGroup;
  role: 'user' | 'trainer' = 'user';
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private notiService: NotyService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.role = params['role'] === 'trainer' ? 'trainer' : 'user';
    });

    this.registerForm = this.fb.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(25),
            Validators.pattern(/^[a-zA-Z][a-zA-Z\s\-_']*$/
),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, passwordStrengthValidator()]],
        confirmPassword: ['', [Validators.required]],
        role: [this.role],
      },
      {
        validators: matchPassword('password', 'confirmPassword'),
      }
    );
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.registerForm.value;
    this.authService.registerUser(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.notiService.showSuccess('OTP sent successfully');
        this.router.navigate(['/auth/otp'], {
          queryParams: { role: response.data.role },
        });
      },
      error: (error) => {
        const errMsg = error?.error?.message || 'Registration failed.';
        this.notiService.showError(errMsg);
        this.errorMessage = errMsg;
        this.isLoading = false;
      },
    });
  }

  get name() {
    return this.registerForm.get('name');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  redirectToLogin() {
    this.router.navigate(['/auth/login'], { queryParams: { role: this.role } });
  }
}
