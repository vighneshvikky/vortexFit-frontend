import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  BookingService,
  BookingFilters,
} from '../../services/bookings.service';
import { CommonModule } from '@angular/common';
import {
  BookingSession,
  BookingStatus,
} from './interface/trainer.session.interface';
import { User } from '../../../admin/services/admin.service';
import { TrainerService } from '../../services/trainer.service';
import { FormsModule } from '@angular/forms';
import {  debounceTime, Subject, takeUntil } from 'rxjs';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';



@Component({
  selector: 'app-trainer-session',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './trainer-session.component.html',
  styleUrl: './trainer-session.component.scss',
})
export class TrainerSessionComponent implements OnInit, OnDestroy {
  // Data properties
  bookingData: BookingSession[] = [];
  filteredBookingData: BookingSession[] = [];
  availableClients: { id: string; name: string }[] = [];

  // State properties
  loading = true;
  filterLoading = false;
  userData!: User;
  selectedBooking!: BookingSession;
  showModal = false;
  loadingUserData = false;
  currentStatus: BookingStatus = BookingStatus.PENDING;
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 3; 

  
  useServerSideFiltering = true; 
  filters = {
    client: null as { id: string; name: string } | null,
    status: '',
    dateFrom: '',
    dateTo: '',
  };


  availableStatuses: string[] = Object.values(BookingStatus);

  private destroy$ = new Subject<void>();

  private filterSubject = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private trainerService: TrainerService
  ) {
    this.filterSubject
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.useServerSideFiltering) {
          this.loadFilteredDataFromServer();
        }
      });
  }

  ngOnInit(): void {
    this.loadBookingData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

 
  loadBookingData(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;

    this.bookingService
      .getBooking(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('intial', data)
          this.bookingData = data.bookings || [];
          this.filteredBookingData = [...this.bookingData];
          this.totalPages = Math.ceil(data.totalRecords / this.pageSize) || 1;

          this.loadClientNames();
          if (!this.useServerSideFiltering) {
            this.extractFilterOptions();
          }

          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading booking data:', error);
          this.bookingData = [];
          this.filteredBookingData = [];
          this.totalPages = 1;
          this.loading = false;
        },
      });
  }

  loadClientNames(): void {
    this.availableClients = this.bookingData
      .filter((b) => b.userId && b.userId._id && b.userId.name)
      .map((b) => ({ id: b.userId._id, name: b.userId.name }));

    this.availableClients = this.availableClients.filter(
      (client, index, self) =>
        index === self.findIndex((c) => c.id === client.id)
    );
  }

  loadFilteredDataFromServer(page: number = 1): void {
    this.filterLoading = true;
    this.currentPage = page;

    const filters: BookingFilters = {
      clientId: this.filters.client ? this.filters.client.id : undefined,
      status: this.filters.status || undefined,
      dateFrom: this.filters.dateFrom || undefined,
      dateTo: this.filters.dateTo || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    // Remove empty filters
    Object.keys(filters).forEach((key) => {
      if (!filters[key as keyof BookingFilters])
        delete filters[key as keyof BookingFilters];
    });

    this.bookingService
      .getFilteredBookings(filters, page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('data from the backend', data);
          this.filteredBookingData = data.bookings;
          this.totalPages = Math.ceil(data.totalRecords / this.pageSize);
          this.filterLoading = false;
        },
        error: (error) => {
          console.error('Error loading filtered data:', error);
          this.filteredBookingData = [];
          this.filterLoading = false;
        },
      });
  }

  extractFilterOptions(): void {
    const uniqueUsers = new Map<string, string>();

    this.bookingData.forEach((booking) => {
      if (booking.userId?._id && booking.userId?.name?.trim()) {
        uniqueUsers.set(booking.userId._id, booking.userId.name.trim());
      }
    });

    this.availableClients = Array.from(uniqueUsers.entries())
      .map(([id, name]) => ({ id, name })) 
      .sort((a, b) => a.name.localeCompare(b.name)); 
  }


  applyFilters(): void {
    if (this.useServerSideFiltering) {
      this.loadFilteredDataFromServer();
    }
  }

  // Reset all filters
  clearFilters(): void {
    this.filters = {
      client: null as { id: string; name: string } | null,
      status: '',
      dateFrom: '',
      dateTo: '',
    };

    if (this.useServerSideFiltering) {
      this.loadFilteredDataFromServer();
    } else {
      this.filteredBookingData = [...this.bookingData];
    }
  }


  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getDefaultFromDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.client ||
      this.filters.status ||
      this.filters.dateFrom ||
      this.filters.dateTo
    );
  }

  // Formatting methods
  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  formatSessionType(sessionType: string): string {
    if (!sessionType) return '';

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
    if (!sessionType) return '';
    const type = sessionType.toLowerCase().replace(/[\s-]/g, '');
    return `session-type-${type}`;
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    return `status-${status.toLowerCase()}`;
  }

  viewSession(bookingId: string, userId: string): void {

    this.selectedBooking = this.bookingData.find(
      (booking) => booking._id === bookingId
    )!;
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
    if (!this.selectedBooking) {
      console.error('No booking selected for status update');
      return;
    }

    this.bookingService
      .updateBookingStatus(this.selectedBooking._id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
   
            const bookingIndex = this.bookingData.findIndex(
              (b) => b._id === this.selectedBooking._id
            );
            if (bookingIndex !== -1) {
              this.bookingData[bookingIndex].status = newStatus;
            }

           
            const filteredIndex = this.filteredBookingData.findIndex(
              (b) => b._id === this.selectedBooking._id
            );
            if (filteredIndex !== -1) {
              this.filteredBookingData[filteredIndex].status = newStatus;
            }

            this.selectedBooking.status = newStatus;

            console.log('Status updated successfully:', response);
          } else {
            console.error('Failed to update booking status');
          }
        },
        error: (error) => {
          console.error('Error updating status:', error);
        },
      });
  }

  getAvailableStatuses(currentStatus: string): BookingStatus[] {
    switch (currentStatus) {
      case BookingStatus.PENDING:
        return [
          BookingStatus.PENDING,
          BookingStatus.CONFIRMED,
          BookingStatus.CANCELLED,
        ];
      case BookingStatus.CONFIRMED:
        return [
          BookingStatus.CONFIRMED,
          BookingStatus.COMPLETED,
          BookingStatus.CANCELLED,
        ];
      case BookingStatus.COMPLETED:
        return [BookingStatus.COMPLETED];
      case BookingStatus.CANCELLED:
        return [BookingStatus.CANCELLED];
      default:
        return [BookingStatus.PENDING];
    }
  }

  calculateAge(dob: string): number {
    if (!dob) return 0;

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}
