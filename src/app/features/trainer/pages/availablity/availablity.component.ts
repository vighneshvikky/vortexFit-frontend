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
import { firstValueFrom } from 'rxjs';
import { SlotPickerModalComponent } from '../../modals/slot-picker-modal/slot-picker-modal.component';
import { Availability, AvailablityService } from '../../services/availablity.service';
import { FormsModule } from '@angular/forms';
import { NotyService } from '../../../../core/services/noty.service';

interface CalendarDay {
  date: number;
  fullDate: string;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  hasAvailability?: boolean; // New property to track availability
  isPastDate?: boolean; // New property to track past dates
}

interface TimeSlot {
  start: string;
  end: string;
}

interface Session {
  id: string;
  clientName: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'completed';
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
    FormsModule
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
  
  // Store all availability data for the month
  monthlyAvailability: Map<string, any> = new Map();

  // Availability state
  showAvailabilityForm = false;
  newTimeSlots: TimeSlot[] = [{ start: '', end: '' }];
  currentAvailability: Availability | null = null;
  availabilityData: { 
    date: string; 
    slots: { start: string; end: string }[] 
  } | null = null;

  loading = false;
  error: string | null = null;

  async ngOnInit() {
    // Select today by default
    const today = new Date();
    this.selectedDate = this.formatDateForApi(today);
    
    // Load monthly availability first, then generate calendar
    await this.loadMonthlyAvailability();
    this.generateCalendar();
    this.loadAvailability();
  }

  get currentMonthYear(): string {
    return this.currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the first Sunday of the calendar view
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    this.calendarDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const fullDate = this.formatDateForApi(date);
      const isCurrentMonth = date.getMonth() === month;
      const isToday = this.isSameDate(date, today);
      const isSelected = this.selectedDate === fullDate;
      
      // Check if it's a past date
      const dateForComparison = new Date(date);
      dateForComparison.setHours(0, 0, 0, 0);
      const isPastDate = dateForComparison < today;
      
      // Check if this date has availability
      const hasAvailability = this.monthlyAvailability.has(fullDate);
      
      this.calendarDays.push({
        date: date.getDate(),
        fullDate,
        isCurrentMonth,
        isSelected,
        isToday,
        isPastDate,
        hasAvailability
      });
    }
  }

  selectDate(day: CalendarDay) {
    if (!day.isCurrentMonth) return;
    
    // Update selected state
    this.calendarDays.forEach(d => d.isSelected = false);
    day.isSelected = true;
    
    this.selectedDate = day.fullDate;
    this.showAvailabilityForm = false;
    this.resetForm();
    
    console.log('🔵 Selected date:', this.selectedDate);
    this.loadAvailability();
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

  toggleAvailabilityForm() {
    // Check if selected date is in the past
    if (this.isSelectedDatePast()) {
      this.notyfy.showError('Cannot set availability for past dates');
      return;
    }
    
    this.showAvailabilityForm = !this.showAvailabilityForm;
    if (!this.showAvailabilityForm) {
      this.resetForm();
    }
  }

  addTimeSlot() {
    this.newTimeSlots.push({ start: '', end: '' });
  }

  removeTimeSlot(index: number) {
    if (this.newTimeSlots.length > 1) {
      this.newTimeSlots.splice(index, 1);
    }
  }

  async saveAvailability() {
    if (!this.selectedDate) return;

    // Check if selected date is in the past
    if (this.isSelectedDatePast()) {
      this.notyfy.showError('Cannot set availability for past dates');
      return;
    }

    // Validate time slots
    const validSlots = this.newTimeSlots.filter(slot =>
      slot.start && slot.end && slot.start < slot.end
    );

    if (validSlots.length === 0) {
      this.error = 'Please add at least one valid time slot';
      this.notyfy.showError(this.error);
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      console.log('🔵 Slots before formatting:', validSlots);

      const slotsFormatted = validSlots.map(slot => `${slot.start}-${slot.end}`);
      console.log('🔷 Formatted slot strings:', slotsFormatted);

      const payload = {
        date: this.selectedDate,
        slots: slotsFormatted,
      };

      const response = await firstValueFrom(this.availabilityService.setAvailability(payload));

      // Update availability data immediately
      const newAvailabilityData = {
        date: this.selectedDate,
        slots: validSlots
      };
      
      this.availabilityData = newAvailabilityData;
      
      // Update monthly availability cache
      this.monthlyAvailability.set(this.selectedDate, newAvailabilityData);
      console.log('🟢 Saved and cached availability for:', this.selectedDate);
      
      // Force full calendar regeneration to ensure colors update
      console.log('🔄 Forcing calendar regeneration after save...');
      this.generateCalendar();
      
      this.showAvailabilityForm = false;
      this.resetForm();
      
    } catch (err: any) {
      console.log('error saving availability', err);
      const errMsg = err?.error?.message || 'Failed to save availability';
      this.notyfy.showError(errMsg);
    } finally {
      this.loading = false;
    }
  }

  async loadAvailability() {
    if (!this.selectedDate) return;
    
    this.availabilityService.getMyAvailability(this.selectedDate).subscribe({
      next: (response) => {
        console.log('🟢 Availability response for', this.selectedDate, ':', response);
        this.availabilityData = response;
        
        // Update monthly availability cache
        const hasSlots = response && response.slots && response.slots.length > 0;
        
        if (hasSlots) {
          this.monthlyAvailability.set(this.selectedDate!, response);
          console.log('🟢 Added to cache:', this.selectedDate, response);
        } else {
          this.monthlyAvailability.delete(this.selectedDate!);
          console.log('🔴 Removed from cache:', this.selectedDate);
        }
        
        // Force regenerate calendar to update visual indicators
        console.log('🔄 Forcing calendar regeneration...');
        this.generateCalendar();
      },
      error: (err) => {
        console.log('🔴 Error loading availability', err);
        this.availabilityData = null;
        this.monthlyAvailability.delete(this.selectedDate!);
        this.generateCalendar();
      }
    });
  }

  // Helper method to update calendar availability without full regeneration
  private updateCalendarAvailability() {
    console.log('🔄 BEFORE update - Calendar days with availability:', this.calendarDays.filter(d => d.hasAvailability).length);
    
    this.calendarDays.forEach(day => {
      const hadAvailability = day.hasAvailability;
      day.hasAvailability = this.monthlyAvailability.has(day.fullDate);
      
      if (hadAvailability !== day.hasAvailability) {
        console.log(`🔄 Changed availability for ${day.fullDate}: ${hadAvailability} -> ${day.hasAvailability}`);
      }
    });
    
    console.log('🔄 AFTER update - Calendar days with availability:', this.calendarDays.filter(d => d.hasAvailability).length);
    console.log('🔄 Updated calendar availability. Cache size:', this.monthlyAvailability.size);
    console.log('🔄 Cache contents:', Array.from(this.monthlyAvailability.keys()));
    
    // Force Angular change detection
    this.calendarDays = [...this.calendarDays];
  }

  // Load availability for all days in the current month
  async loadMonthlyAvailability() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // Get first and last day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Clear existing monthly availability
    this.monthlyAvailability.clear();
    
    // If you have a batch API to get all availability for the month, use it here
    // For now, we'll use a different approach - load availability for each day
    // This is a simplified version - you should implement a proper monthly API call
    
    try {
      // Generate all dates for the month
      const dates = [];
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        dates.push(this.formatDateForApi(date));
      }
      
      // Load availability for each date (this should ideally be a single API call)
      // You can implement this with Promise.all or use a batch API endpoint
      
      // For now, this will be populated as we load individual dates
      console.log('Monthly availability loading for dates:', dates);
      
    } catch (error) {
      console.error('Error loading monthly availability:', error);
    }
  }

  async deleteAvailability() {
    if (!this.selectedDate || !this.currentAvailability) return;

    if (!confirm('Are you sure you want to delete all availability for this date?')) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      await this.availabilityService.deleteAvailability(this.selectedDate).toPromise();
      this.currentAvailability = null;
      this.availabilityData = null;
      
      // Remove from monthly availability cache
      this.monthlyAvailability.delete(this.selectedDate);
      
      // Regenerate calendar to update visual indicators
      this.generateCalendar();
    } catch (error) {
      this.error = 'Failed to delete availability. Please try again.';
      console.error('Error deleting availability:', error);
    } finally {
      this.loading = false;
    }
  }

  formatSelectedDate(): string {
    if (!this.selectedDate) return '';
    const date = new Date(this.selectedDate);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatTime(time: string): string {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  }

  isSelectedDateToday(): boolean {
    if (!this.selectedDate) return false;
    const today = new Date();
    return this.selectedDate === this.formatDateForApi(today);
  }

  isSelectedDatePast(): boolean {
    if (!this.selectedDate) return false;
    const selectedDateObj = new Date(this.selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDateObj.setHours(0, 0, 0, 0);
    return selectedDateObj < today;
  }

  // Check if we should show the add availability button
  canAddAvailability(): boolean {
    return this.selectedDate !== null && !this.isSelectedDatePast();
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

  private resetForm() {
    this.newTimeSlots = [{ start: '', end: '' }];
    this.error = null;
  }

  
}