import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { firstValueFrom } from 'rxjs';
import {
  Availability,
  AvailablityService,
} from '../../services/availablity.service';
import { FormsModule } from '@angular/forms';
import { NotyService } from '../../../../core/services/noty.service';

interface BackendError {
  error?: {
    message?: string;
  };
}

interface CalendarDay {
  date: number;
  fullDate: string;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  hasAvailability?: boolean;
  isPastDate?: boolean;
  activeSlotCount?: number;
}

interface TimeSlot {
  id?: string;
  start: string;
  end: string;
  isActive: boolean;
  isDefault: boolean;
  dateSpecific?: boolean;
}

interface DayAvailability {
  date: string;
  slots: TimeSlot[];
  hasActiveSlots: boolean;
}

@Component({
  selector: 'app-availability',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSlideToggleModule,
    MatCardModule,
    MatTabsModule,
    MatExpansionModule,
    FormsModule,
  ],
  templateUrl: './availablity.component.html',
  styleUrl: './availablity.component.scss',
})
export class AvailabilityComponent implements OnInit {
  private availabilityService = inject(AvailablityService);
  private notyfy = inject(NotyService);

  // Calendar state
  currentDate = new Date();
  selectedDate: string | null = null;
  calendarDays: CalendarDay[] = [];
  dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Default time slots that apply to all days
  defaultTimeSlots: TimeSlot[] = [
    { start: '09:00', end: '10:00', isActive: true, isDefault: true },
    { start: '10:00', end: '11:00', isActive: true, isDefault: true },
    { start: '11:00', end: '12:00', isActive: true, isDefault: true },
    { start: '14:00', end: '15:00', isActive: true, isDefault: true },
    { start: '15:00', end: '16:00', isActive: true, isDefault: true },
    { start: '16:00', end: '17:00', isActive: true, isDefault: true },
  ];

  // Store all availability data for the month
  monthlyAvailability: Map<string, DayAvailability> = new Map();

  // Current day's availability
  currentDayAvailability: DayAvailability | null = null;

  // UI State
  showSlotManagement = false;
  showDefaultSlotManager = false;
  newSlot: TimeSlot = { start: '', end: '', isActive: true, isDefault: false };
  loading = false;
  error: string | null = null;
  activeTab = 0; // 0: Day View, 1: Default Settings

  async ngOnInit() {
    // Select today by default
    const today = new Date();
    this.selectedDate = this.formatDateForApi(today);

    // Load default settings first
    await this.loadDefaultSlots();

    // Load monthly availability and generate calendar
    await this.loadMonthlyAvailability();
    this.generateCalendar();
    this.loadDayAvailability();
  }

  get currentMonthYear(): string {
    return this.currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    this.calendarDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const fullDate = this.formatDateForApi(date);
      const isCurrentMonth = date.getMonth() === month;
      const isToday = this.isSameDate(date, today);
      const isSelected = this.selectedDate === fullDate;

      const dateForComparison = new Date(date);
      dateForComparison.setHours(0, 0, 0, 0);
      const isPastDate = dateForComparison < today;

      // Get availability info for this date
      const dayAvailability = this.getDayAvailability(fullDate);
      const hasAvailability = dayAvailability.hasActiveSlots;
      const activeSlotCount = dayAvailability.slots.filter(
        (s) => s.isActive
      ).length;

      this.calendarDays.push({
        date: date.getDate(),
        fullDate,
        isCurrentMonth,
        isSelected,
        isToday,
        isPastDate,
        hasAvailability,
        activeSlotCount,
      });
    }
  }

  selectDate(day: CalendarDay) {
    if (!day.isCurrentMonth) return;

    this.calendarDays.forEach((d) => (d.isSelected = false));
    day.isSelected = true;

    this.selectedDate = day.fullDate;
    this.showSlotManagement = false;
    this.resetNewSlot();

    this.loadDayAvailability();
  }

  async previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    await this.loadMonthlyAvailability();
    this.generateCalendar();
  }

  async nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    await this.loadMonthlyAvailability();
    this.generateCalendar();
  }

  // Get availability for a specific date (combines default + custom slots)
  getDayAvailability(date: string): DayAvailability {
    const stored = this.monthlyAvailability.get(date);
    if (stored) {
      return stored;
    }

    // Return default slots for this date
    const defaultSlots = this.defaultTimeSlots.map((slot) => ({
      ...slot,
      id: `default-${date}-${slot.start}-${slot.end}`,
    }));

    return {
      date,
      slots: defaultSlots,
      hasActiveSlots: defaultSlots.some((s) => s.isActive),
    };
  }

  loadDayAvailability() {
    if (!this.selectedDate) return;

    this.currentDayAvailability = this.getDayAvailability(this.selectedDate);

    // Load from API if needed
    this.availabilityService.getMyAvailability(this.selectedDate).subscribe({
      next: (response) => {
        if (response && response.slots) {
          this.updateDayAvailabilityFromAPI(response);
        }
      },
      error: (err) => {
        console.log(
          'No specific availability found for this date, using defaults'
        );
      },
    });
  }

  updateDayAvailabilityFromAPI(apiResponse: any) {
    if (!this.selectedDate) return;

    const slots: TimeSlot[] = [];

    // Add default slots
    this.defaultTimeSlots.forEach((defaultSlot) => {
      slots.push({
        ...defaultSlot,
        id: `default-${this.selectedDate}-${defaultSlot.start}-${defaultSlot.end}`,
      });
    });

    // Add/update custom slots from API
    if (apiResponse.slots) {
      apiResponse.slots.forEach((apiSlot: any) => {
        const existingIndex = slots.findIndex(
          (s) => s.start === apiSlot.start && s.end === apiSlot.end
        );

        if (existingIndex >= 0) {
          // Update existing slot
          slots[existingIndex] = {
            ...slots[existingIndex],
            isActive: apiSlot.isActive !== undefined ? apiSlot.isActive : true,
            dateSpecific: true,
          };
        } else {
          // Add new custom slot
          slots.push({
            id:
              apiSlot.id ||
              `custom-${this.selectedDate}-${apiSlot.start}-${apiSlot.end}`,
            start: apiSlot.start,
            end: apiSlot.end,
            isActive: apiSlot.isActive !== undefined ? apiSlot.isActive : true,
            isDefault: false,
            dateSpecific: true,
          });
        }
      });
    }

    const dayAvailability: DayAvailability = {
      date: this.selectedDate,
      slots: slots.sort((a, b) => a.start.localeCompare(b.start)),
      hasActiveSlots: slots.some((s) => s.isActive),
    };

    this.monthlyAvailability.set(this.selectedDate, dayAvailability);
    this.currentDayAvailability = dayAvailability;
    this.generateCalendar();
  }

  async loadMonthlyAvailability() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    this.monthlyAvailability.clear();

    // In a real app, you'd load all month data in one API call
    // For now, we'll populate as needed
  }

  async loadDefaultSlots() {
    // Load default slots from API or local storage
    // For now, using hardcoded defaults
    try {
      // const defaults = await this.availabilityService.getDefaultSlots();
      // this.defaultTimeSlots = defaults;
    } catch (error) {
      console.log('Using hardcoded default slots');
    }
  }

  toggleSlotStatus(slot: TimeSlot) {
    if (!this.selectedDate || this.isSelectedDatePast()) return;

    slot.isActive = !slot.isActive;
    this.saveDayAvailability();
  }

  addNewSlot() {
    if (!this.selectedDate || this.isSelectedDatePast()) return;

    if (!this.newSlot.start || !this.newSlot.end) {
      this.notyfy.showError('Please fill in both start and end times');
      return;
    }

    if (this.newSlot.start >= this.newSlot.end) {
      this.notyfy.showError('End time must be after start time');
      return;
    }

    // Check for overlapping slots
    const hasOverlap = this.currentDayAvailability?.slots.some(
      (slot) => slot.isActive && this.slotsOverlap(slot, this.newSlot)
    );

    if (hasOverlap) {
      this.notyfy.showError(
        'This time slot overlaps with an existing active slot'
      );
      return;
    }

    const newSlot: TimeSlot = {
      id: `custom-${this.selectedDate}-${this.newSlot.start}-${this.newSlot.end}`,
      start: this.newSlot.start,
      end: this.newSlot.end,
      isActive: true,
      isDefault: false,
      dateSpecific: true,
    };

    if (this.currentDayAvailability) {
      this.currentDayAvailability.slots.push(newSlot);
      this.currentDayAvailability.slots.sort((a, b) =>
        a.start.localeCompare(b.start)
      );
      this.currentDayAvailability.hasActiveSlots =
        this.currentDayAvailability.slots.some((s) => s.isActive);
    }

    this.saveDayAvailability();
    this.resetNewSlot();
    this.showSlotManagement = false;
  }

  slotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
    return slot1.start < slot2.end && slot2.start < slot1.end;
  }

  async saveDayAvailability() {
    if (!this.selectedDate || !this.currentDayAvailability) return;

    this.loading = true;

    try {
      const payload = {
        date: this.selectedDate,
        slots: this.currentDayAvailability.slots.map((slot) => ({
          id: slot.id,
          start: slot.start,
          end: slot.end,
          isActive: slot.isActive,
          isDefault: slot.isDefault,
          dateSpecific: slot.dateSpecific,
        })),
      };

      await firstValueFrom(this.availabilityService.setAvailability(payload));

      this.monthlyAvailability.set(
        this.selectedDate,
        this.currentDayAvailability
      );
      this.generateCalendar();
      this.notyfy.showSuccess('Availability updated successfully');
    } catch (error) {
      this.notyfy.showError('Failed to save availability');
      console.error('Error saving availability:', error);
    } finally {
      this.loading = false;
    }
  }

  async updateDefaultSlots() {
    this.loading = true;

    try {
      const payload = {
        defaultSlots: this.defaultTimeSlots,
      };

      // await firstValueFrom(this.availabilityService.setDefaultSlots(payload));

      this.notyfy.showSuccess('Default slots updated successfully');

      // Refresh calendar to show updated defaults
      this.generateCalendar();
    } catch (error) {
      this.notyfy.showError('Failed to update default slots');
      console.error('Error updating default slots:', error);
    } finally {
      this.loading = false;
    }
  }

  addDefaultSlot() {
    if (!this.newSlot.start || !this.newSlot.end) {
      this.notyfy.showError('Please fill in both start and end times');
      return;
    }

    if (this.newSlot.start >= this.newSlot.end) { 
      this.notyfy.showError('End time must be after start time');
      return;
    }

    const newSlot: TimeSlot = {
      start: this.newSlot.start,
      end: this.newSlot.end,
      isActive: true,
      isDefault: true,
    };

    this.defaultTimeSlots.push(newSlot);
    this.defaultTimeSlots.sort((a, b) => a.start.localeCompare(b.start));

    this.resetNewSlot();
    this.updateDefaultSlots();

    const payload = {
      date: this.selectedDate,
      slots: this.defaultTimeSlots.map((slot) => `${slot.start}-${slot.end}`),
    };

    this.availabilityService.setAvailability(payload).subscribe({
      next: (res) => {
this.notyfy.showSuccess('Availability updated successfully');
 console.log('✅ Availability response:', res);
      },
      error: (error) => {
        console.log('hai error')
this.notyfy.showError('Failed to update availability');
      console.error('❌ API error:', error);
      }
    })
  }

  toggleDefaultSlot(slot: TimeSlot) {
    slot.isActive = !slot.isActive;
    this.updateDefaultSlots();
  }

  formatSelectedDate(): string {
    if (!this.selectedDate) return '';
    const date = new Date(this.selectedDate);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  }

  isSelectedDatePast(): boolean {
    if (!this.selectedDate) return false;
    const selectedDateObj = new Date(this.selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDateObj.setHours(0, 0, 0, 0);
    return selectedDateObj < today;
  }

  canManageSlots(): boolean {
    return this.selectedDate !== null && !this.isSelectedDatePast();
  }

  getSlotTypeLabel(slot: TimeSlot): string {
    if (slot.isDefault && !slot.dateSpecific) return 'Default';
    if (slot.dateSpecific) return 'Custom';
    return 'Default';
  }

  getActiveSlotCount(): number {
    return (
      this.currentDayAvailability?.slots.filter((s) => s.isActive).length || 0
    );
  }

  getTotalSlotCount(): number {
    return this.currentDayAvailability?.slots.length || 0;
  }

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  resetNewSlot() {
    this.newSlot = { start: '', end: '', isActive: true, isDefault: false };
  }
}
