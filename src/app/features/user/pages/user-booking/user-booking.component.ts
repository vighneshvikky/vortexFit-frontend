import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Trainer } from '../../../trainer/models/trainer.interface';
import { UserService } from '../../services/user.service';
import { NotyService } from '../../../../core/services/noty.service';
import { SchedulingRule } from '../../../trainer/models/scheduling.interface';
import { formatTime as formatTimeAmPm } from '../../../../shared/methods/time.checker';

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isAvailable: boolean;
  isSelected: boolean;
  fullDate: Date;
}

interface TimeSlot {
  time: string;
  isBooked: boolean;
  isAvailable: boolean;
}

interface SessionType {
  id: string;
  name: string;
  price: number;
  description: string;
}

@Component({
  selector: 'app-user-booking',
  styleUrl: './user-booking.component.scss',
  templateUrl: './user-booking.component.html',
  imports: [CommonModule],
  standalone: true,
})
export class UserBookingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private notyf = inject(NotyService);
  private http = inject(HttpClient);

  // Trainer data
  trainer: Trainer | null = null;
  trainerId: string = '';
  isLoading: boolean = true;

  // Session selection
  selectedSessionType: string = '';
  sessionTypes: SessionType[] = [];

  // Calendar and date selection
  currentDate: Date = new Date();
  selectedDate: Date | null = null;
  calendarDays: CalendarDay[] = [];
  currentMonthYear: string = '';
  trainerRules: SchedulingRule[] = [];
  hoverMessage: string | null = null;
  // Time slots
  selectedTimeSlot: TimeSlot | null = null;
  availableTimeSlots: TimeSlot[] = [];
  timeSlots = [];

  // Confirmation modal
  showConfirmationModal: boolean = false;
  bookingId: string = '';

  ngOnInit() {
    this.trainerId = this.route.snapshot.paramMap.get('id') || '';
    this.userService
      .generateSlots(this.trainerId)
      .subscribe((res: SchedulingRule[]) => {
       this.trainerRules = res;
       console.log('trainerRules', this.trainerRules)
       // Rebuild calendar once rules are loaded so availability reflects actual rules
       this.generateCalendar();
       this.updateCurrentMonthYear();
      });
    if (this.trainerId) {
      this.fetchTrainerData();
    } else {
      this.notyf.showError('Trainer ID not found');
      this.router.navigate(['/user/dashboard']);
    }
  }

  fetchTrainerData() {
    this.isLoading = true;
    this.userService.getTrainerData(this.trainerId).subscribe({
      next: (response) => {
        this.trainer = response;
        this.initializeSessionTypes();
        this.generateCalendar();
        this.updateCurrentMonthYear();
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
        {
          id: 'workout-plan',
          name: 'Workout Plan',
          price: this.trainer.pricing.workoutPlan,
          description: 'Custom plan for you to follow independently',
        },
      ];
    }
  }

  // Session type selection
  selectSessionType(type: string) {
    this.selectedSessionType = type;
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
    const lastDay = new Date(year, month + 1, 0);
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

    if (checkDate < today) return false;

    const dayOfWeek = checkDate.getDay(); // 0-6, Sun-Sat
    const dateStr = this.formatDateLocal(checkDate);

    // A date is available if at least one active rule applies for that date
    return this.trainerRules.some((rule) => {
      if (!rule.isActive) return false;

      const start = new Date(rule.startDate);
      const end = new Date(rule.endDate);
      // Normalize times
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      const inRange = checkDate >= start && checkDate <= end;
      const allowedDay = rule.daysOfWeek?.includes(dayOfWeek);
      const notExceptional = !(rule.exceptionalDays || []).includes(dateStr);

      return inRange && !!allowedDay && notExceptional;
    });
  }

  selectDate(day: CalendarDay) {
    if (!day.isCurrentMonth) {
      this.notyf.showInfo('Please select a date in the current month');
      return;
    }

    if (!day.isAvailable) {
      const reason = this.getUnavailableReason(day.fullDate);
      this.notyf.showInfo(reason);
      return;
    }

    this.calendarDays.forEach((d) => (d.isSelected = false));
    day.isSelected = true;

    this.selectedDate = day.fullDate;

    this.selectedTimeSlot = null;

    this.generateTimeSlotsForSelectedDate(day.fullDate);
  }

  onDayHover(day: CalendarDay) {
    if (!day.isCurrentMonth) {
      this.hoverMessage = 'Pick a date in the current month';
      return;
    }
    if (!day.isAvailable) {
      this.hoverMessage = this.getUnavailableReason(day.fullDate);
    } else {
      this.hoverMessage = null;
    }
  }

  onDayLeave() {
    this.hoverMessage = null;
  }

  private generateTimeSlotsForSelectedDate(selectedDate: Date) {
    const dateStr = this.formatDateLocal(selectedDate);

    const applicableRules = this.trainerRules.filter((rule) => {
      if (!rule.isActive) return false;
      const start = new Date(rule.startDate);
      const end = new Date(rule.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const inRange = selectedDate >= start && selectedDate <= end;
      const allowedDay = rule.daysOfWeek?.includes(selectedDate.getDay());
      const notExceptional = !(rule.exceptionalDays || []).includes(dateStr);
      return inRange && !!allowedDay && notExceptional;
    });

    const generated: TimeSlot[] = [];

    for (const rule of applicableRules) {
      const slotsForRule = this.generateSlotsForRuleAndDate(rule, selectedDate);
      generated.push(...slotsForRule);
    }

    // Remove duplicates by time label
    const uniqueByTime = new Map<string, TimeSlot>();
    for (const slot of generated) {
      if (!uniqueByTime.has(slot.time)) uniqueByTime.set(slot.time, slot);
    }
    this.availableTimeSlots = Array.from(uniqueByTime.values());

    if (this.availableTimeSlots.length === 0) {
      this.notyf.showInfo('No available slots for this date');
    }
  }

  private generateSlotsForRuleAndDate(
    rule: SchedulingRule,
    date: Date
  ): TimeSlot[] {
    const results: TimeSlot[] = [];
    // Build a reference date string but use time math in minutes
    const [startH, startM] = rule.startTime.split(':').map(Number);
    const [endH, endM] = rule.endTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    let current = startTotal;
    while (current + rule.slotDuration <= endTotal) {
      const hour = Math.floor(current / 60)
        .toString()
        .padStart(2, '0');
      const minute = (current % 60).toString().padStart(2, '0');
      const label24 = `${hour}:${minute}`;
      const label = formatTimeAmPm(label24);

      results.push({
        time: label,
        isBooked: false,
        isAvailable: true,
      });

      current += rule.slotDuration + rule.bufferTime;
    }

    return results;
  }

  generateTimeSlots(selectedDate: Date) {
    // const slots = [
    //   { time: '09:00 AM', isBooked: false, isAvailable: true },
    //   { time: '10:00 AM', isBooked: false, isAvailable: true },
    //   { time: '11:00 AM', isBooked: true, isAvailable: false },
    //   { time: '12:00 PM', isBooked: false, isAvailable: true },
    //   { time: '02:00 PM', isBooked: false, isAvailable: true },
    //   { time: '03:00 PM', isBooked: false, isAvailable: true },
    //   { time: '04:00 PM', isBooked: true, isAvailable: false },
    //   { time: '05:00 PM', isBooked: false, isAvailable: true },
    //   { time: '06:00 PM', isBooked: false, isAvailable: true }
    // ];
    // this.availableTimeSlots = slots.filter(slot => slot.isAvailable);
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

  private getUnavailableReason(date: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cmp = new Date(date);
    cmp.setHours(0, 0, 0, 0);

    if (cmp < today) return 'Past dates are not bookable';

    const dateStr = this.formatDateLocal(cmp);
    const day = cmp.getDay();

    const inAnyRange = this.trainerRules.some((r) => {
      if (!r.isActive) return false;
      const s = new Date(r.startDate);
      const e = new Date(r.endDate);
      s.setHours(0, 0, 0, 0);
      e.setHours(0, 0, 0, 0);
      return cmp >= s && cmp <= e;
    });

    if (!inAnyRange) return 'No sessions scheduled for this date range';

    const isExceptional = this.trainerRules.some(
      (r) => (r.exceptionalDays || []).includes(dateStr)
    );
    if (isExceptional) return 'Trainer is unavailable on this date';

    const allowedByWeekday = this.trainerRules.some(
      (r) => r.isActive && r.daysOfWeek?.includes(day)
    );
    if (!allowedByWeekday) return 'No sessions offered on this weekday';

    return 'No available slots for this date';
  }

  // Time slot selection
  selectTimeSlot(slot: TimeSlot) {
    if (!slot.isAvailable || slot.isBooked) return;
    this.selectedTimeSlot = slot;
  }

  // Booking confirmation
  confirmBooking() {
    if (
      !this.selectedSessionType ||
      !this.selectedDate ||
      !this.selectedTimeSlot
    ) {
      this.notyf.showError('Please select all required fields');
      return;
    }

    // Generate booking ID
    this.bookingId = 'BK' + Date.now().toString().slice(-6);
    this.showConfirmationModal = true;
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }

  addToCalendar() {
    // Implementation for adding to calendar
    console.log('Adding to calendar...');
    this.notyf.showSuccess('Added to calendar successfully');
  }

  messageTrainer() {
    // Implementation for messaging trainer
    console.log('Opening chat with trainer...');
    this.notyf.showSuccess('Opening chat with trainer');
  }

  scrollToBooking() {
    // Scroll to the session selection section
    const sessionSection = document.querySelector('.session-selection');
    if (sessionSection) {
      sessionSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Helper methods
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
}
