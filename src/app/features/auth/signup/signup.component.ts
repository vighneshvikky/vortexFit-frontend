import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  matchPassword,
  passwordStrengthValidator,
} from '../../../core/validators/password.validators';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  @Input() role: 'user' | 'trainer' = 'user';
  isLoading = false;
  errorMessage: string | null = null;
  registerForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(10),
            Validators.pattern(/^[a-zA-Z][a-zA-Z\s\-']*$/),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, passwordStrengthValidator()]],
        confirmPassword: ['', [Validators.required]],
        role: [this.role]
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
        console.log('✅ Registration Success:', response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Registration Failed:', error);
        this.errorMessage = error?.error?.message || 'Registration failed.';
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
}
