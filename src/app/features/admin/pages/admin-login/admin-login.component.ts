import { Component } from '@angular/core';
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
import { AuthState } from '../../../auth/store/auth.state';
import { login } from '../../../auth/store/actions/auth.actions';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  loginError: string | null = null;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private store: Store<AuthState>,
    private adminService: AdminService,
    private router: Router,
    private notyService: NotyService
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

onSubmit(): void {
  if (this.loginForm.valid) {
    this.isSubmitting = true;
    this.loginError = null;

    const { email, password } = this.loginForm.value;
    this.store.dispatch(
      login({
        email,
        password,
        role: 'admin'
      })
    );
  }
}
}