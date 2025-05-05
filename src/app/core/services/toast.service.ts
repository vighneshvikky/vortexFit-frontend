import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<Toast | null>(null);
  toast$ = this.toastSubject.asObservable();

  show(toast: Toast) {
    this.toastSubject.next(toast);
    if (toast.duration) {
      setTimeout(() => this.hide(), toast.duration);
    }
  }

  hide() {
    this.toastSubject.next(null);
  }
} 