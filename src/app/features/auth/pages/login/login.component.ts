import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { Store, StoreModule } from '@ngrx/store';
//  import { login } from '../state/auth.actions';
import { login } from '../../store/actions/auth.actions';
// import { AppState } from '../../state/app.state';
import { AuthState } from '../../store/auth.state';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { Store } from '@ngrx/store';
import { selectAuthError, selectIsLoading } from '../../store/selectors/auth.selectors';
import { Subscription } from 'rxjs';
import { NotyService } from '../../../../core/services/noty.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  role: 'user' | 'trainer' = 'user';
  isLoading = false;
  errorMessage: string | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private store: Store<AuthState>,
    private router: Router,
    private route: ActivatedRoute,
    private notyService: NotyService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.role = params['role'] || 'user';
    });

    // Subscribe to loading state
    this.subscriptions.add(
      this.store.select(selectIsLoading).subscribe(loading => {
        this.isLoading = loading;
      })
    );

    // Subscribe to error state
    this.subscriptions.add(
      this.store.select(selectAuthError).subscribe(error => {
        if (error) {
          this.errorMessage = error;
          this.notyService.showError(error);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage = null;
      this.store.dispatch(login({ 
        credentials: {
          ...this.loginForm.value,
          role: this.role
        }
      }));
    }
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password'], { queryParams: { role: this.role } });
  }
}
