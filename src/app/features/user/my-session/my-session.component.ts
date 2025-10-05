import { Component } from '@angular/core';
import {
  BookingSession,
  BookingStatus,
} from '../../trainer/pages/trainer-session/interface/trainer.session.interface';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import {
  BookingFilters,
  BookingService,
} from '../../trainer/services/bookings.service';
import { Router } from '@angular/router';
import { User } from '../../admin/services/admin.service';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FormsModule } from '@angular/forms';
import { VideoCallComponent } from '../../../core/video-call/video-call.component';
import {
  FilterComponent,
  FilterConfig,
  FilterValues,
  FilterOption,
} from '../../../shared/components/filter/filter.component';
import { NotyService } from '../../../core/services/noty.service';

@Component({
  selector: 'app-my-session',
  imports: [
    CommonModule,
    PaginationComponent,
    FormsModule,
    VideoCallComponent,
    FilterComponent,
  ],
  templateUrl: './my-session.component.html',
  styleUrl: './my-session.component.scss',
})
export class MySessionComponent {
  bookingData: BookingSession[] = [];
  filteredBookingData: BookingSession[] = [];
  filterConfig: FilterConfig = {
    entityLabel: 'Trainer',
    entityPlaceholder: 'All Trainers',
    showEntityFilter: true,
    showStatusFilter: true,
    showDateFilters: true,
    showSearchFilter: true,
    searchPlaceholder: 'Search by trainer name, date, time, or status...',
    statusOptions: Object.values(BookingStatus),
    theme: 'user',
  };

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
    searchTerm: '',
  };

  selectedSession: BookingSession | null = null;
  isVideoCallOpen = false;
  availableStatuses: string[] = Object.values(BookingStatus);

  private destroy$ = new Subject<void>();

  private filterSubject = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private notify: NotyService,
    private router: Router
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
      .getUserBooking(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('intial', data);
          this.bookingData = data.bookings || [];
          this.filteredBookingData = [...this.bookingData];
          this.totalPages = Math.ceil(data.totalRecords / this.pageSize) || 1;

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

  get availableTrainers(): FilterOption[] {
    return this.bookingData
      .filter((b) => b.trainerId && b.trainerId._id && b.trainerId.name)
      .map((b) => ({ id: b.trainerId._id, name: b.trainerId.name }))
      .filter(
        (trainer, index, self) =>
          index === self.findIndex((t) => t.id === trainer.id)
      );
  }

  loadFilteredDataFromServer(page: number = 1): void {
    this.filterLoading = true;
    this.currentPage = page;

    const filters: BookingFilters = {
      clientId: this.filters.client ? this.filters.client.id : undefined,
      status: this.filters.status || undefined,
      dateFrom: this.filters.dateFrom || undefined,
      searchTerm: this.filters.searchTerm || undefined,
      dateTo: this.filters.dateTo || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    Object.keys(filters).forEach((key) => {
      const value = filters[key as keyof BookingFilters];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        delete filters[key as keyof BookingFilters];
      }
    });

    this.bookingService
      .getUserFilteredBookings(filters, page, this.pageSize)
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
  }

  applyFilters(): void {
    if (this.useServerSideFiltering) {
      this.loadFilteredDataFromServer();
    }
  }

  onSearchPerformed(searchTerm: string): void {
    this.filters.searchTerm = searchTerm;
    this.currentPage = 1;
    this.loadFilteredDataFromServer();
  }

  onFiltersApplied(filterValues: FilterValues): void {
    this.filters.client = filterValues.entity;
    this.filters.status = filterValues.status;
    this.filters.dateFrom = filterValues.dateFrom;
    this.filters.dateTo = filterValues.dateTo;
    this.filters.searchTerm = filterValues.searchTerm;

    this.currentPage = 1;
    this.loadFilteredDataFromServer();
  }

  onFiltersCleared(): void {
    console.log('Filters cleared');
    this.filters = {
      client: null,
      status: '',
      dateFrom: '',
      dateTo: '',
      searchTerm: '',
    };
    this.currentPage = 1;
    this.loadFilteredDataFromServer();
  }

  quickSearch(term: string): void {
    this.filters.searchTerm = term;
    this.currentPage = 1;
    this.loadFilteredDataFromServer();
  }

  clearSearchOnly(): void {
    this.filters.searchTerm = '';
    this.loadFilteredDataFromServer();
  }

  clearFilters(): void {
    this.filters = {
      client: null as { id: string; name: string } | null,
      status: '',
      dateFrom: '',
      dateTo: '',
      searchTerm: '',
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

  startVideoCall(session: BookingSession): void {
    if (session.status === 'confirmed') {
      this.selectedSession = session;
      this.isVideoCallOpen = true;
    }
  }

  cancelBooking(id: string) {
  if (confirm('Are you sure you want to cancel this booking?')) {
    this.bookingService.cancelBooking(id).subscribe({
      next: (res) => {
        console.log('res');
         this.notify.showSuccess('Booking cancelled and refund initiated!');
      this.loadFilteredDataFromServer();
      },
    });
  }
}


  onCallEnded(): void {
    this.isVideoCallOpen = false;
    this.selectedSession = null;
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
