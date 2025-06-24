import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blocked',
  imports: [CommonModule],
  templateUrl: './blocked.component.html',
  styleUrl: './blocked.component.scss'
})
export class BlockedComponent {
  private router = inject(Router)
@Input() title?: string;
  @Input() message?: string;
  @Input() reasons?: string[];

  onRetry() {
    // Handle retry logic
    console.log('Retry clicked');
  }

  onGoBack() {
  this.router.navigate(['/'])
  }

  onContactSupport() {
    // Handle contact support logic
    console.log('Contact support clicked');
  }
}
