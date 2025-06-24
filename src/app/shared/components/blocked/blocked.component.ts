import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-blocked',
  imports: [CommonModule],
  templateUrl: './blocked.component.html',
  styleUrl: './blocked.component.scss'
})
export class BlockedComponent {
@Input() title?: string;
  @Input() message?: string;
  @Input() reasons?: string[];

  onRetry() {
    // Handle retry logic
    console.log('Retry clicked');
  }

  onGoBack() {
    // Handle go back logic
    window.history.back();
  }

  onContactSupport() {
    // Handle contact support logic
    console.log('Contact support clicked');
  }
}
