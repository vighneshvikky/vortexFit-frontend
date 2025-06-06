import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotyService } from '../../../../core/services/noty.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp',
  imports: [FormsModule, CommonModule],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.scss',
})
export class OtpComponent implements OnInit {
  email = '';
  otp = '';
  role: 'user' | 'trainer' = 'user';

  message = '';
  errorMessage = '';

  timer = 60;
  isResendDisabled = true;
  interval: any;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private notyService: NotyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.role = params['role'] === 'trainer' ? 'trainer' : 'user';
      this.startTimer();
    });
  }

  verifyOtp() {
    this.authService.verifyOtp(this.email, this.otp, this.role).subscribe({
      next: (res) => {
        console.log('res from otp verfication', res)
        this.message = res.message;
        this.errorMessage = '';
        this.notyService.showSuccess('Login successfully.');
        console.log('res.role', res.data.role)
        this.router.navigate(['/auth/login'], {queryParams: {role: res.data.role}})
      },
      error: (err) => {
         console.error('Raw error:', err.error);
        this.errorMessage = err.error?.message || 'OTP verification failed.';
        this.message = '';
        this.notyService.showError(err?.error?.message);
    
      },
    });
  }

  resendOtp() {
    this.authService.resendOtp(this.email, this.role).subscribe({
      next: (res) => {
        this.message = res.message;
        this.errorMessage = '';
        this.startTimer();
        this.notyService.showSuccess('OTP sent successfully');
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Resending OTP failed.';
        this.message = '';
        this.notyService.showError(err?.error?.message);
      },
    });
  }

  startTimer() {
    this.isResendDisabled = true;
    this.timer = 60;
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        this.isResendDisabled = false;
        clearInterval(this.interval);
      }
    }, 1000);
  }
}
