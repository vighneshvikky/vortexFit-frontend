import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { TimeSlot } from '../user-booking/interface/user-booking.interface';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

export interface BookingData {
  bookingId: string;
  trainerName: string;
  sessionType: string;
  date: string;
  timeSlot: TimeSlot | null;
  amount: number;
}

@Component({
  selector: 'app-user-confirm-booking',
  imports: [CommonModule],
  templateUrl: './user-confirm-booking.component.html',
  styleUrl: './user-confirm-booking.component.scss',
})
export class UserConfirmBookingComponent implements OnInit {
  // Properties for the booking confirmation
  bookingId: string = '';
  trainerName: string = '';
  sessionType: string = '';
  date: string = '';
  timeSlot: TimeSlot | null = null;
  amount: number = 0;
  isVerifying: boolean = false;

  @Output() addToCalendar = new EventEmitter<void>();
  @Output() messageTrainer = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {

    const navigation = history.state;
    if (navigation && navigation.bookingData) {
      this.setBookingData(navigation.bookingData);
    } else {

      this.route.queryParams.subscribe((params) => {
        if (params['bookingId']) {
          this.bookingId = params['bookingId'];
          this.trainerName = params['trainerName'] || '';
          this.sessionType = params['sessionType'] || '';
          this.date = params['date'] || '';
          this.amount = parseFloat(params['amount']) || 0;
          
          if (params['timeSlot']) {
            try {
              this.timeSlot = JSON.parse(params['timeSlot']);
            } catch (e) {
              console.error('Error parsing timeSlot:', e);
            }
          }
        }
      });
    }
  }

  setBookingData(data: BookingData) {
    this.bookingId = data.bookingId;
    this.trainerName = data.trainerName;
    this.sessionType = data.sessionType;
    this.date = data.date;
    this.timeSlot = data.timeSlot;
    this.amount = data.amount;
  }

  getFormattedSessionType(): string {
    switch (this.sessionType) {
      case 'one-to-one':
        return 'One-to-One Session';
      case 'workout-plan':
        return 'Workout Plan';
      default:
        return this.sessionType || 'Session';
    }
  }

  getTimeSlotDisplay(): string {
    if (!this.timeSlot) return 'Time not specified';
    return `${this.timeSlot} - ${this.timeSlot}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Date not specified';

    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return dateString; 
    }
  }

  onMessageTrainer() {
    console.log('Opening chat with trainer...');


    this.router.navigate(['/user/messages'], {
      queryParams: {
        trainerId: this.trainerName,
        bookingId: this.bookingId,
      },
    });

    this.messageTrainer.emit();
  }

  onClose() {

    this.router.navigate(['/user/dashboard']);
    this.closeModal.emit();
  }



 

  getModalAnimationClass(): string {
    return this.isVerifying
      ? 'confirmation-modal-enter'
      : 'confirmation-modal-enter-active';
  }
}
