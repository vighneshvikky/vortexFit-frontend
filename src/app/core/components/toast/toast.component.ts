import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="toast" 
         [class]="getToastClasses()"
         class="fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out min-w-[300px]">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div [class]="getIconClasses()" class="mr-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path *ngIf="toast.type === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              <path *ngIf="toast.type === 'error'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              <path *ngIf="toast.type === 'info'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="font-medium">{{ toast.message }}</p>
            <div *ngIf="countdown > 0" class="text-xs opacity-80 mt-1">
              Redirecting in {{ countdown }}s...
            </div>
          </div>
        </div>
        <button (click)="toastService.hide()" class="ml-4 text-white opacity-70 hover:opacity-100">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div *ngIf="countdown > 0" class="mt-2 h-1 bg-white bg-opacity-20 rounded-full overflow-hidden">
        <div [style.width.%]="(countdown / initialCountdown) * 100" class="h-full bg-white transition-all duration-1000"></div>
      </div>
    </div>
  `,
  styles: []
})
export class ToastComponent implements OnInit, OnDestroy {
  toast: Toast | null = null;
  countdown = 0;
  initialCountdown = 0;
  private countdownSubscription?: Subscription;

  constructor(public toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toast$.subscribe(toast => {
      this.toast = toast;
      if (toast?.duration) {
        this.initialCountdown = Math.ceil(toast.duration / 1000);
        this.countdown = this.initialCountdown;
        this.startCountdown();
      }
    });
  }

  ngOnDestroy() {
    this.stopCountdown();
  }

  private startCountdown() {
    this.stopCountdown();
    this.countdownSubscription = interval(1000).subscribe(() => {
      if (this.countdown > 0) {
        this.countdown--;
      }
    });
  }

  private stopCountdown() {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  getToastClasses(): string {
    if (!this.toast) return '';
    
    const baseClasses = 'text-white font-medium';
    switch (this.toast.type) {
      case 'success':
        return `${baseClasses} bg-green-500`;
      case 'error':
        return `${baseClasses} bg-red-500`;
      case 'info':
        return `${baseClasses} bg-blue-500`;
      default:
        return `${baseClasses} bg-gray-500`;
    }
  }

  getIconClasses(): string {
    if (!this.toast) return '';
    return 'p-2 rounded-full bg-white bg-opacity-20';
  }
} 