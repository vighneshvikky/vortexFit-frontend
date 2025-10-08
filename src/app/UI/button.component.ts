import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  template: `
    <button (click)="clicked()" [ngClass]="buttonClass">
      <i *ngIf="icon" [ngClass]="'fas fa-' + icon"></i>
      {{ text }}
    </button>
  `,
})
export class ButtonComponent {
  @Input()
  text = '';

  @Input()
  icon = '';

  @Input()
  buttonClass = 'text-white rounded-xl font-semibold';

  @Output() clickEvent = new EventEmitter<void>();

  clicked() {
    this.clickEvent.emit();
  }
}
