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

  // Event emitters for actions
  @Output() addToCalendar = new EventEmitter<void>();
  @Output() messageTrainer = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Get data from navigation state or query parameters
    const navigation = history.state;
    if (navigation && navigation.bookingData) {
      this.setBookingData(navigation.bookingData);
    } else {
      // Fallback: get from query parameters
      this.route.queryParams.subscribe((params) => {
        if (params['bookingId']) {
          this.bookingId = params['bookingId'];
          this.trainerName = params['trainerName'] || '';
          this.sessionType = params['sessionType'] || '';
          this.date = params['date'] || '';
          this.amount = parseFloat(params['amount']) || 0;
          // For timeSlot, you might need to parse it from JSON string
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
      return dateString; // Fallback to original string if parsing fails
    }
  }

  onMessageTrainer() {
    console.log('Opening chat with trainer...');

    // Navigate to chat/message component with trainer info
    // You can pass trainer data or booking data to the message component
    this.router.navigate(['/user/messages'], {
      queryParams: {
        trainerId: this.trainerName, // You might want to pass trainer ID instead
        bookingId: this.bookingId,
      },
    });

    this.messageTrainer.emit();
  }

  onClose() {
    // Navigate back to user dashboard or previous page
    this.router.navigate(['/user/dashboard']);
    this.closeModal.emit();
  }

  private generateCalendarFile(eventData: any) {
    // Generate ICS file for calendar integration
    const startDate = new Date(eventData.start);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//VortexFit//Booking Confirmation//EN',
      'BEGIN:VEVENT',
      `DTSTART:${this.formatDateForICS(startDate)}`,
      `DTEND:${this.formatDateForICS(endDate)}`,
      `SUMMARY:${eventData.title}`,
      `DESCRIPTION:${eventData.sessionType} session with ${eventData.trainer}\\nTime: ${eventData.timeSlot}\\nBooking ID: ${this.bookingId}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Session starting in 15 minutes',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    // Create and download the ICS file
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vortexfit-booking-${this.bookingId}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private formatDateForICS(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  // Animation trigger methods for enter/leave animations
  getModalAnimationClass(): string {
    return this.isVerifying
      ? 'confirmation-modal-enter'
      : 'confirmation-modal-enter-active';
  }
}
