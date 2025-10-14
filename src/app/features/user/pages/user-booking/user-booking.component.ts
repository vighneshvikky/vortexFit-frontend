import { Component, NgZone, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Trainer } from '../../../trainer/models/trainer.interface';
import { UserService } from '../../services/user.service';
import { NotyService } from '../../../../core/services/noty.service';
import { SchedulingRule } from '../../../trainer/models/scheduling.interface';
import { PaymentService } from '../../services/payment.service';


import {
  CalendarDay,
  PaymentSuccessResponse,
  RazorpayPaymentFailedResponse,
  SessionBookingRequest,
  SessionType,
  TimeSlot,
  TimeSlotsResponse,
} from './interface/user-booking.interface';
import {
  Wallet,
  WalletService,
} from '../../../../core/services/wallet.service';
import { environment } from '../../../../../environments/environment';

export interface WalletResponse {
  success: boolean;
  wallet: Wallet;
}

export interface LockSlotRequest {
  trainerId: string;
  date: string;
  timeSlot: TimeSlot;
  amount: number;
  sessionType: string;
}

@Component({
  selector: 'app-user-booking',
  styleUrls: ['./user-booking.component.scss'],
  templateUrl: './user-booking.component.html',
  imports: [CommonModule],
  standalone: true,
})
export class UserBookingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private paymentService = inject(PaymentService);
  private notyf = inject(NotyService);
  private ngZone = inject(NgZone);
  private walletService = inject(WalletService);

  trainer: Trainer | null = null;
  trainerId: string = '';
  isLoading: boolean = true;

  selectedSessionType: string = '';
  sessionTypes: SessionType[] = [];
  selectedPrice!: number;

  currentDate: Date = new Date();
  selectedDate: Date | null = null;
  calendarDays: CalendarDay[] = [];
  currentMonthYear: string = '';
  trainerRules: SchedulingRule[] = [];
  hoverMessage: string | null = null;

  selectedTimeSlot: TimeSlot | null = null;
  availableTimeSlots: TimeSlot[] = [];
  isLoadingSlots: boolean = false;
  slotsErrorMessage: string = '';

  balance: number = 0;

  // Confirmation modal
  showConfirmationModal: boolean = false;
  bookingId: string = '';
  ngOnInit() {
    this.trainerId = this.route.snapshot.paramMap.get('id') || '';
    if (this.trainerId) {
      this.fetchTrainerData();
    } else {
      this.notyf.showError('Trainer ID not found');
    }
    // Initialize calendar without trainer rules

    this.walletService.getBalance().subscribe((res) => {
      this.balance = res.balance;
    });
    this.generateCalendar();
    this.updateCurrentMonthYear();
  }

  fetchTrainerData() {
    this.isLoading = true;
    this.userService.getTrainerData(this.trainerId).subscribe({
      next: (response) => {
        this.trainer = response;
        this.initializeSessionTypes();
        this.isLoading = false;
      },
      error: (err) => {
        this.notyf.showError('Failed to fetch trainer data');
        this.isLoading = false;
        console.error('Error fetching trainer data:', err);
      },
    });
  }

  initializeSessionTypes() {
    if (this.trainer?.pricing) {
      this.sessionTypes = [
        {
          id: 'one-to-one',
          name: 'One-to-One Session',
          price: this.trainer.pricing.oneToOneSession,
          description:
            'Personalized training session with warm-up, workout & cool-down',
        },
        // {
        //   id: 'workout-plan',
        //   name: 'Workout Plan',
        //   price: this.trainer.pricing.workoutPlan,
        //   description: 'Custom plan for you to follow independently',
        // },
      ];
    }
  }

  // Session type selection
  selectSessionType(type: string, price: number) {
    this.selectedSessionType = type;
    this.selectedPrice = price;
  }

  getSessionTypeName(): string {
    const session = this.sessionTypes.find(
      (s) => s.id === this.selectedSessionType
    );
    return session ? session.name : '';
  }

  getSessionPrice(): number {
    const session = this.sessionTypes.find(
      (s) => s.id === this.selectedSessionType
    );
    return session ? session.price : 0;
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    this.calendarDays = [];

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const isCurrentMonth = currentDate.getMonth() === month;
      const isAvailable = this.isDateAvailable(currentDate);

      this.calendarDays.push({
        date: currentDate.getDate(),
        isCurrentMonth,
        isAvailable,
        isSelected: false,
        fullDate: new Date(currentDate),
      });
    }
  }

  isDateAvailable(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Only allow future dates (including today)
    return checkDate >= today;
  }

  selectDate(day: CalendarDay) {
    if (!day.isCurrentMonth) {
      this.notyf.showInfo('Please select a date in the current month');
      return;
    }

    if (!day.isAvailable) {
      this.notyf.showInfo('This date is not available for booking');
      return;
    }

    this.calendarDays.forEach((d) => (d.isSelected = false));
    day.isSelected = true;

    this.selectedDate = day.fullDate;
    this.selectedTimeSlot = null;

    this.fetchTimeSlotsFromBackend(day.fullDate);
  }

  private fetchTimeSlotsFromBackend(selectedDate: Date) {
    this.isLoadingSlots = true;
    this.availableTimeSlots = [];
    this.slotsErrorMessage = '';

    const dateStr = this.formatDateForAPI(selectedDate);

    this.userService.getTimeSlots(this.trainerId, dateStr).subscribe({
      next: (response: TimeSlotsResponse) => {
        console.log('response from the backend', response);
        this.isLoadingSlots = false;

        if (response.success && response.slots) {
          this.availableTimeSlots = response.slots;
          this.slotsErrorMessage = '';

          if (response.slots.length === 0) {
            this.slotsErrorMessage =
              'No available slots for this date. Please pick another day.';
          }
        } else {
          this.availableTimeSlots = [];
          this.slotsErrorMessage =
            response.message ||
            'No available slots for this date. Please pick another day.';
        }
      },
      error: (error) => {
        this.isLoadingSlots = false;
        this.availableTimeSlots = [];
        this.slotsErrorMessage = 'Failed to load time slots. Please try again.';
        console.error('Error fetching time slots:', error);
        this.notyf.showError('Failed to load available time slots');
      },
    });
  }

  private formatDateForAPI(date: Date): string {
    return this.formatDateLocal(date);
  }

  onDayHover(day: CalendarDay) {
    if (!day.isCurrentMonth) {
      this.hoverMessage = 'Pick a date in the current month';
      return;
    }
    if (!day.isAvailable) {
      this.hoverMessage = 'This date is not available for booking';
    } else {
      this.hoverMessage = null;
    }
  }

  onDayLeave() {
    this.hoverMessage = null;
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
    this.updateCurrentMonthYear();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
    this.updateCurrentMonthYear();
  }

  updateCurrentMonthYear() {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
    };
    this.currentMonthYear = this.currentDate.toLocaleDateString(
      'en-US',
      options
    );
  }

  private formatDateLocal(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  selectTimeSlot(slot: TimeSlot) {
    this.selectedTimeSlot = slot;
  }

  bookingUsingWallet() {
    if (this.balance < this.selectedPrice) {
      this.notyf.showError('Insufficient Wallet Balance');
      return;
    }

    const payload = {
      trainerId: this.trainerId,
      amount: this.selectedPrice,
      sessionType: this.selectedSessionType,
      date: this.formatDateForAPI(this.selectedDate!),
      timeSlot: this.selectedTimeSlot,
    };

    this.walletService.payWithWallet(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.balance = res.balance;

          this.ngZone.run(() => {
            this.balance = res.balance;
            this.availableTimeSlots = this.availableTimeSlots.filter(
              (slot) => slot !== this.selectedTimeSlot
            );
          });

          this.notyf.showSuccess('Booking confirmed successfully!');

          const bookingData = {
            bookingId: res.bookingId, // coming from backend
            trainerName: this.getTrainerName(),
            sessionType: this.selectedSessionType,
            date: this.formatDateForAPI(this.selectedDate!),
            timeSlot: this.selectedTimeSlot,
            amount: this.selectedPrice,
          };

          this.router.navigate(['user/confirmBooking'], {
            state: { bookingData },
          });
        }
      },
      error: (err) => {
        console.error('Wallet payment failed:', err);
        this.notyf.showError(err.error?.message || 'Wallet payment failed');
      },
    });
  }

  confirmBooking() {
    if (!this.selectedSessionType) {
      this.notyf.showError('Please select a session type');
      return;
    }

    if (!this.selectedDate) {
      this.notyf.showError('Please select a date');
      return;
    }

    if (!this.selectedTimeSlot) {
      this.notyf.showError('Please select a time slot');
      return;
    }

    const lockData: LockSlotRequest = {
      trainerId: this.trainerId,
      amount: this.selectedPrice,
      sessionType: this.selectedSessionType,
      date: this.formatDateForAPI(this.selectedDate),
      timeSlot: this.selectedTimeSlot,
    };

    // Step 1: Lock the slot first
    this.paymentService.lockSlot(lockData).subscribe({
      next: (res) => {
        console.log('Slot locked successfully:', res);

       
        const bookingData: SessionBookingRequest = {
          trainerId: this.trainerId,
          amount: this.selectedPrice,
          sessionType: this.selectedSessionType,
          date: this.formatDateForAPI(this.selectedDate!),
          timeSlot: this.selectedTimeSlot!,
        };

        this.paymentService.createOrder(bookingData).subscribe({
          next: (orderRes) => {
            console.log('Order creation response:', orderRes);
            this.openRazorpayCheckout(orderRes.order);
          },
          error: (err) => {
            console.error('Order creation failed', err);
            this.notyf.showError('Something went wrong while starting payment');
          },
        });
      },
      error: (err) => {
        console.error('Slot locking failed', err);
        this.notyf.showError(err.error?.message || 'Slot is already booked');
      },
    });
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }

  addToCalendar() {
    console.log('Adding to calendar...');
    this.notyf.showSuccess('Added to calendar successfully');
  }

  messageTrainer() {
    console.log('Opening chat with trainer...');
    this.notyf.showSuccess('Opening chat with trainer');
  }

  scrollToBooking() {
    const sessionSection = document.querySelector('.session-selection');
    if (sessionSection) {
      sessionSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getTrainerImage(): string {
    return this.trainer?.image || 'assets/images/default-trainer.jpg';
  }

  getTrainerName(): string {
    return this.trainer?.name || 'Trainer';
  }

  getTrainerCategory(): string {
    return this.trainer?.category || 'Fitness';
  }

  getTrainerExperience(): string {
    return this.trainer?.experience
      ? `${this.trainer.experience} years experience`
      : 'Experience not specified';
  }

  getTrainerBio(): string {
    return this.trainer?.bio || 'No bio available';
  }

  openRazorpayCheckout(order: {
    id: string;
    amount: number;
    currency: string;
  }) {
    const options: Razorpay.Options = {
      key: environment.razorpayKey,
      amount: order.amount,
      currency: order.currency,
      name: 'VortexFit Booking',
      description: 'Session Booking Payment',
      order_id: order.id,
      handler: (response: Razorpay.PaymentSuccessResponse) => {
        if (response) {
          const enrichedResponse: PaymentSuccessResponse = {
            ...response,
            trainerId: this.trainerId,
            sessionType: this.selectedSessionType,
            date: this.formatDateForAPI(this.selectedDate!),
            timeSlot: this.selectedTimeSlot,
            amount: this.selectedPrice,
          };

          this.verifyPaymentInBackground(enrichedResponse);
        }
      },
      prefill: {
        name: 'VortexFit User',
        email: 'user@vortexfit.com',
        contact: '9999999999',
      },
      theme: {
        color: '#3B82F6',
      },
    };

    const rzp = new Razorpay(options);

    rzp.on('payment.failed', (response: RazorpayPaymentFailedResponse) => {
      console.error('Payment failed:', response);
      this.handleFailedPayment(response, order.amount);

      this.notyf.showError('Payment failed: ' + response.error.description);
    });

    rzp.open();
  }

  private handleFailedPayment(
    response: RazorpayPaymentFailedResponse,
    amount: number
  ) {
    const payload = {
      orderId: response.error.metadata.order_id,
      paymentId: response.error.metadata.payment_id,
      amount: amount,
      reason: response.error.description,
    };

    this.ngZone.run(() => {
      this.walletService.addFailedPayment(payload).subscribe({
        next: (res: WalletResponse) => {
          console.log('res', res);
          if (res && res.wallet.balance !== undefined) {
            this.balance = res.wallet.balance;
          }

          this.notyf.showSuccess('Payment failed, money added to your wallet');
          this.router.navigate([`/user/booking/${this.trainerId}`]);
        },
        error: () => {
          this.notyf.showError(
            'Could not update wallet, please contact support'
          );
        },
      });
    });
  }
  private verifyPaymentInBackground(response: PaymentSuccessResponse) {
    this.paymentService
      .verifyOrder({
        ...response,
        trainerId: this.trainerId,
        sessionType: this.selectedSessionType,
        date: this.formatDateForAPI(this.selectedDate!),
        timeSlot: this.selectedTimeSlot,
        amount: this.selectedPrice,
      })
      .subscribe({
        next: (verifyRes) => {
          if (verifyRes.status === 'success') {
            this.ngZone.run(() => {
              this.bookingId = verifyRes.bookingId;
              this.availableTimeSlots = this.availableTimeSlots.filter(
                (slot) => slot !== this.selectedTimeSlot
              );
            });

            this.notyf.showSuccess('Booking confirmed successfully!');

            const bookingData = {
              bookingId: verifyRes.bookingId,
              trainerName: this.getTrainerName(),
              sessionType: this.selectedSessionType,
              date: this.formatDateForAPI(this.selectedDate!),
              timeSlot: this.selectedTimeSlot,
              amount: this.selectedPrice,
            };

            this.router.navigate(['user/confirmBooking'], {
              state: { bookingData },
            });
          } else {
            this.notyf.showError('Payment verification failed');
            this.bookingId = '';
          }
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.availableTimeSlots = this.availableTimeSlots.filter(
              (slot) => slot !== this.selectedTimeSlot
            );
          });

          const backendMessage =
            err.error?.message || 'Payment verification failed';
          this.notyf.showError(backendMessage);

          this.showConfirmationModal = false;
          this.bookingId = '';
        },
      });
  }
}
