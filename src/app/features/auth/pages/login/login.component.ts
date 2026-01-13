import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import * as AuthActions from '../../store/actions/auth.actions';
import {
  selectAuthError,
  selectAuthLoading,
} from '../../store/selectors/auth.selectors';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { NotyService } from '../../../../core/services/noty.service';
import { ActivatedRoute } from '@angular/router';
import { AppState } from '../../../../store/app.state';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';
import { loginSuccess } from '../../store/actions/auth.actions';
import { AdminService } from '../../../admin/services/admin.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  loading = false;
  errorMessage: string | null = null;
  role: 'user' | 'trainer' = 'user';

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private router: Router,
    private notyService: NotyService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private adminService: AdminService
  ) {
    const roleParam = this.route.snapshot.queryParamMap.get('role');
    this.role = roleParam === 'trainer' ? 'trainer' : 'user';

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.loading$ = this.store
      .select(selectAuthLoading)
      .pipe(map((loading) => loading ?? false));
    this.error$ = this.store.select(selectAuthError);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.role = params['role'] === 'trainer' ? 'trainer' : 'user';

      if (this.router.url.startsWith('/auth/callback')) {
        const userJson = params['user'];
        if (userJson) {
          try {
            const user: AuthActions.AuthenticatedUser = JSON.parse(userJson);
            this.store.dispatch(AuthActions.loginSuccess({ user }));
          } catch (err) {
            console.log(err);
            this.notyService.showError('Invalid user data format');
            this.router.navigate(['/auth/login']);
          }
        } else {
          this.notyService.showError('No user data received');
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = null;

    const { email, password } = this.loginForm.value;
    const role = this.role;

    this.authService.login({ email, password, role }).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('response for login', response);
        if (response.mfaRequired) {
          this.router.navigate(['/auth/mfa-verify'], {
            queryParams: { userId: response.userId, role: this.role },
          });
          return;
        }

        if (response.mfaSetupRequired) {
          this.router.navigate(['/auth/mfa-setup'], {
            queryParams: { userId: response.userId, role: this.role },
          });
          return;
        }

        this.errorMessage = 'Unexpected response from server';
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.error?.message || 'Login failed. Please try again.';
        this.notyService.showError(this.errorMessage!);
      },
    });
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password'], {
      queryParams: { role: this.role },
    });
  }

  onGoogleLogin() {
    console.log('hai');
    this.store.dispatch(AuthActions.googleLogin({ role: this.role }));
  }
  redirectTosignup() {
    this.router.navigate(['/auth/signup'], {
      queryParams: { role: this.role },
    });
  }
}
