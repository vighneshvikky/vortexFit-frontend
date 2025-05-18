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
import { AuthService } from '../../../../core/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../enviorments/environment';

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
  role: 'user' | 'trainer' = 'user';

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private notyService: NotyService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    const roleParam = this.route.snapshot.queryParamMap.get('role');
    this.role = roleParam === 'trainer' ? 'trainer' : 'user';

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.loading$ = this.store.select(selectAuthLoading).pipe(
      map(loading => loading ?? false)
    );
    this.error$ = this.store.select(selectAuthError);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.role = params['role'] === 'trainer' ? 'trainer' : 'user';
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('role', this.role)
      const { email, password } = this.loginForm.value;
      this.store.dispatch(AuthActions.login({ email, password, role: this.role }));
    }
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password'], {
      queryParams: { role: this.role },
    });
  }
}
