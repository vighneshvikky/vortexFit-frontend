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
import { select, Store } from '@ngrx/store';
import { AuthState } from '../../../auth/store/auth.state';
import { login } from '../../../auth/store/actions/auth.actions';
import { Subject, takeUntil } from 'rxjs';
import { selectAuthError, selectCurrentUser } from '../../../auth/store/selectors/auth.selectors';
import { AppState } from '../../../../store/app.state';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent implements OnDestroy{
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

    this.store.pipe(select(selectAuthError), takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        this.isSubmitting = false;
        this.loginError = error;
      }
    });

    
    this.store.pipe(select(selectCurrentUser), takeUntil(this.destroy$)).subscribe(auth => {
      if (auth) {
        this.isSubmitting = false;
      }
    });

    
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
  if (this.loginForm.valid) {
    this.isSubmitting = true;
    this.loginError = null;
   console.log('hai for admin login')
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