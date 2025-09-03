import { Component                                               , OnInit } from '@angular/core';
import { BookingService } from '../../services/bookings.service';
import {  CommonModule } from '@angular/common';
import { BookingSession, BookingStatus } from './interface/trainer.session.interface';
import { User } from '../../../admin/services/admin.service';
import { TrainerService } from '../../services/trainer.service';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-trainer-session',
  imports: [ CommonModule, FormsModule],
  templateUrl: './trainer-session.component.html',
  styleUrl: './trainer-session.component.scss'
})
export class TrainerSessionComponent implements OnInit{
bookingData: BookingSession[] = [];
  loading = true;
  userData!: User;
  selectedBooking!: BookingSession;
  showModal = false;
  loadingUserData = false;
  currentStatus: BookingStatus = BookingStatus.PENDING;
  constructor(private bookingService: BookingService, private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.loadBookingData();
  }

  loadBookingData(): void {
    this.bookingService.getBooking().subscribe({
      next: (data) => {
        this.bookingData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading booking data:', error);
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today`;
    }

    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow`;
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  formatSessionType(sessionType: string): string {
    switch (sessionType.toLowerCase()) {
      case 'one-to-one':
        return 'Personal Training';
      case 'group':
        return 'Group Session';
      case 'workout-plan':
        return 'Workout Plan';
      default:
        return sessionType.replace(/([A-Z])/g, ' $1').trim();
    }
  }

  getSessionTypeClass(sessionType: string): string {
    const type = sessionType.toLowerCase().replace(/[\s-]/g, '');
    return `session-type-${type}`;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  viewSession(bookingId: string, userId: string): void {
    // Find the booking that matches this userId
    this.selectedBooking = this.bookingData.find(booking => booking._id === bookingId)!;
    this.loadingUserData = true;
    this.showModal = true;

    this.trainerService.getUserData(userId).subscribe({
      next: (res: User) => {
        this.userData = res;
        this.loadingUserData = false;
        console.log('User data loaded:', res);
      },

    });
  }

  closeModal(): void {
    this.showModal = false;
    this.userData = {} as User;
    this.selectedBooking = {} as BookingSession;
  }

  updateBookingStatus(newStatus: string): void {
    if (!this.selectedBooking) return;
    this.bookingService.updateBookingStatus(this.selectedBooking._id  , newStatus).subscribe({
      next: (response) => {
          const bookingIndex = this.bookingData.findIndex(b => b._id === this.selectedBooking._id);
        if (bookingIndex !== -1) {
          this.bookingData[bookingIndex].status = newStatus;
          this.selectedBooking.status = newStatus;
        }
   console.log('response after changing the status', response);
   
      }
    });
  }

 getAvailableStatuses(currentStatus: string): BookingStatus[] {
  switch (currentStatus) {
    case BookingStatus.PENDING:
      return [BookingStatus.CONFIRMED, BookingStatus.CANCELLED];
    case BookingStatus.CONFIRMED:
      return [BookingStatus.COMPLETED, BookingStatus.CANCELLED];
    default:
      return []; 
  }
}

  calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }



  }
