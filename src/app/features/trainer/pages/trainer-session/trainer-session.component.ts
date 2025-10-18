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
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { Router } from '@angular/router';
import { VideoCallComponent } from '../../../../core/video-call/video-call.component';
import {
  FilterComponent,
  FilterConfig,
  FilterValues,
  FilterOption,
} from '../../../../shared/components/filter/filter.component';

@Component({
  selector: 'app-trainer-session',
  imports: [
    CommonModule,
    FormsModule,
    PaginationComponent,
    VideoCallComponent,
    FilterComponent,
  ],
  templateUrl: './trainer-session.component.html',
  styleUrl: './trainer-session.component.scss',
})
export class TrainerSessionComponent implements OnInit, OnDestroy {
  bookingData: BookingSession[] = [];
  filteredBookingData: BookingSession[] = [];

  loading = true;
  filterLoading = false;
  userData!: User;
  selectedBooking!: BookingSession;
  showModal = false;
  loadingUserData = false;
  currentStatus: BookingStatus = BookingStatus.PENDING;
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  pageSize: number = 4;

  useServerSideFiltering = true;

  filters = {
    client: null as { id: string; name: string } | null,
    status: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
  };

  filterConfig: FilterConfig = {
    entityLabel: 'Client',
    entityPlaceholder: 'All Clients',
    showEntityFilter: true,
    showDateFilters: true,
    showStatusFilter: true,
    showSearchFilter: true,
    searchPlaceholder: 'Search by client name, date, time, or status...',
    statusOptions: Object.values(BookingStatus),
  };

  selectedSession: BookingSession | null = null;
  isVideoCallOpen = false;
  availableStatuses: string[] = Object.values(BookingStatus);

  private destroy$ = new Subject<void>();
  private filterSubject = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private trainerService: TrainerService,
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
      .getBooking(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('initial', data);
          this.bookingData = data.bookings || [];
          this.filteredBookingData = [...this.bookingData];
          this.totalRecords = data.totalRecords || 0;
          this.totalPages = data.totalPages;

          if (!this.useServerSideFiltering) {
            this.extractFilterOptions();
          }

          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading booking data:', error);
          this.bookingData = [];
          this.filteredBookingData = [];
          this.totalRecords = 0;
          this.totalPages = 1;
          this.loading = false;
        },
      });
  }

  loadFilteredDataFromServer(page: number = 1): void {
    this.filterLoading = true;
    this.currentPage = page;

    const filters: BookingFilters = {
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    if (this.filters.client?.id) {
      filters.clientId = this.filters.client.id;
    }
    if (this.filters.status) {
      filters.status = this.filters.status;
    }
    if (this.filters.dateFrom) {
      filters.dateFrom = this.filters.dateFrom;
    }
    if (this.filters.dateTo) {
      filters.dateTo = this.filters.dateTo;
    }
    if (this.filters.searchTerm?.trim()) {
      filters.searchTerm = this.filters.searchTerm.trim();
    }

    console.log('Sending filters to backend:', filters);

    this.bookingService
      .getFilteredBookings(filters, page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Filtered data from backend:', data);
          this.filteredBookingData = data.bookings || [];
          this.totalRecords = data.totalRecords || 0;
          this.totalPages =
            data.totalPages ||
            Math.ceil(this.totalRecords / this.pageSize) ||
            1;
          this.filterLoading = false;
        },
        error: (error) => {
          console.error('Error loading filtered data:', error);
          this.filteredBookingData = [];
          this.totalRecords = 0;
          this.totalPages = 1;
          this.filterLoading = false;
        },
      });
  }

  clearSearchOnly(): void {
    this.filters.searchTerm = '';
    this.currentPage = 1;
    this.loadFilteredDataFromServer();
  }

  quickSearch(term: string): void {
    this.filters.searchTerm = term;
    this.currentPage = 1;
    this.loadFilteredDataFromServer();
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
      this.currentPage = 1; // Reset to first page
      this.loadFilteredDataFromServer();
    }
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
    this.loadBookingData(); // Load unfiltered data
  }

  onSearchPerformed(searchTerm: string): void {
    this.filters.searchTerm = searchTerm;
    this.currentPage = 1;
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
    this.currentPage = 1;

    if (this.useServerSideFiltering) {
      this.loadBookingData(); // Load unfiltered data
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
      this.filters.dateTo ||
      this.filters.searchTerm?.trim()
    );
  }

  get availableClients(): FilterOption[] {
    return this.bookingData
      .filter((b) => b.userId && b.userId._id && b.userId.name)
      .map((b) => ({ id: b.userId._id, name: b.userId.name }))
      .filter(
        (client, index, self) =>
          index === self.findIndex((c) => c.id === client.id)
      );
  }

  onFiltersApplied(filterValues: FilterValues): void {
    console.log('Filters applied:', filterValues);

    this.filters.client = filterValues.entity;
    this.filters.status = filterValues.status;
    this.filters.dateFrom = filterValues.dateFrom;
    this.filters.dateTo = filterValues.dateTo;
    this.filters.searchTerm = filterValues.searchTerm || '';

    this.currentPage = 1;
    this.loadFilteredDataFromServer();
  }

  onPageChange(page: number): void {
    console.log('Page changed to:', page);

    if (this.hasActiveFilters()) {
      this.loadFilteredDataFromServer(page);
    } else {
      this.loadBookingData(page);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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

  startVideoCall(session: BookingSession): void {
    if (session.status === 'confirmed') {
      this.selectedSession = session;
      this.selectedBooking = session;
      this.isVideoCallOpen = true;
    }
  }

onCallEnded(): void {
  console.log('Closing Video calls');

  if (this.selectedSession?._id) {
    this.bookingService
      .updateBookingStatus(this.selectedSession._id, BookingStatus.COMPLETED)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
           
            this.filteredBookingData = this.filteredBookingData.map((b) =>
              b._id === response._id ? response : b
            );
            this.bookingData = this.bookingData.map((b) =>
              b._id === response._id ? response : b
            );

            console.log('Booking status updated to completed:', response);
          } else {
            console.error('Failed to update booking status');
          }
        },
        error: (error) => {
          console.error('Error updating status:', error);
        },
      });
  }

  this.isVideoCallOpen = false;
  this.selectedSession = null;
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

  goToMessage(userId: string) {
    console.log('userId', userId);
    this.router.navigate(['/trainer/chat', userId]);
  }
}
