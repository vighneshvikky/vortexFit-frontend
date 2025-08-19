import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TimeSlot } from '../../interface/user-booking.interface';

@Component({
  selector: 'app-confirm-booking-modal',
  imports: [CommonModule],
  templateUrl: './cofirm-booking-modal.component.html',
  styleUrls: ['./cofirm-booking-modal.component.scss'],
  standalone: true
})
export class ConfirmationModalComponent {
  @Input() showModal: boolean = false;
  @Input() bookingId!: string | null;
  @Input() trainerName!: string | null;
  @Input() sessionType!: string | null;
  @Input() date!: string | null;
  @Input() timeSlot!: TimeSlot | null;
   @Input() isVerifying: boolean = false; 

  @Output() close = new EventEmitter<void>();
  @Output() addCalendar = new EventEmitter<void>();
  @Output() messageTrainer = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onAddCalendar() {
    this.addCalendar.emit();
  }

  onMessageTrainer() {
    this.messageTrainer.emit();
  }
}
