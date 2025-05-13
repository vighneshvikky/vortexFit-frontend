import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup;
  token!: string;
  role!: string;
  error: string | null = null;
  success: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  // Custom password validator
  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isLengthValid = value.length >= 6;

    const errors: ValidationErrors = {};
    
    if (!hasUpperCase) errors['noUpperCase'] = true;
    if (!hasLowerCase) errors['noLowerCase'] = true;
    if (!hasNumeric) errors['noNumeric'] = true;
    if (!hasSpecialChar) errors['noSpecialChar'] = true;
    if (!isLengthValid) errors['minLength'] = true;

    return Object.keys(errors).length ? errors : null;
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token')!;
    this.role = this.route.snapshot.queryParamMap.get('role')!;
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', Validators.required],
    });
  }

  onSubmit(): void {
    const { newPassword, confirmPassword } = this.form.value;
  
    if (newPassword !== confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }
  
    this.authService.resetPassword(this.token, this.role, newPassword).subscribe({
      next: (res) => {
        console.log(res.data.role); 
        this.success = true;
        setTimeout(() => this.router.navigate(['/auth/login'], {queryParams: {role: res.data.role}}), 2000);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Reset failed';
      }
    });
  }

  // Helper methods for template
  getPasswordErrors(): string[] {
    const errors: string[] = [];
    const passwordControl = this.form.get('newPassword');
    
    if (passwordControl?.errors) {
      if (passwordControl.errors['noUpperCase']) errors.push('At least one uppercase letter');
      if (passwordControl.errors['noLowerCase']) errors.push('At least one lowercase letter');
      if (passwordControl.errors['noNumeric']) errors.push('At least one number');
      if (passwordControl.errors['noSpecialChar']) errors.push('At least one special character');
      if (passwordControl.errors['minLength']) errors.push('Minimum 6 characters');
    }
    
    return errors;
  }
}
