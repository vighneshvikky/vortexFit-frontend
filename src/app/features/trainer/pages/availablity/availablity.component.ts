
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
interface CalendarDay {
  date: number;
  fullDate: string;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
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

  // Calendar state
  currentDate = new Date();
  selectedDate: string | null = null;
  calendarDays: CalendarDay[] = [];
  dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Availability state
  showAvailabilityForm = false;
  newTimeSlots: TimeSlot[] = [{ start: '', end: '' }];
  currentAvailability: Availability | null = null;

  // // Sessions state (mock data - replace with actual service)
  // todaySessions: Session[] = [
  //   {
  //     id: '1',
  //     clientName: 'John Doe',
  //     startTime: '09:00',
  //     endTime: '10:00',
  //     status: 'confirmed'
  //   },
  //   {
  //     id: '2',
  //     clientName: 'Jane Smith',
  //     startTime: '14:00',
  //     endTime: '15:00',
  //     status: 'pending'
  //   }
  // ];

  // UI state
  loading = false;
  error: string | null = null;

  ngOnInit() {
    this.generateCalendar();
    // Select today by default
    const today = new Date();
    this.selectedDate = this.formatDateForApi(today);
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
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const fullDate = this.formatDateForApi(date);
      const isCurrentMonth = date.getMonth() === month;
      const isToday = this.isSameDate(date, today);
      const isSelected = this.selectedDate === fullDate;
      
      this.calendarDays.push({
        date: date.getDate(),
        fullDate,
        isCurrentMonth,
        isSelected,
        isToday
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
    this.loadAvailability();
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  toggleAvailabilityForm() {
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
  console.log('📅 Selected Date:', this.selectedDate);

  if (!this.selectedDate) return;

  // Validate time slots
  const validSlots = this.newTimeSlots.filter(slot =>
    slot.start && slot.end && slot.start < slot.end
  );

  if (validSlots.length === 0) {
    this.error = 'Please add at least one valid time slot';
    return;
  }

  this.loading = true;
  this.error = null;

  console.log('🔵 Slots before formatting:', validSlots);

  const slotsFormatted = validSlots.map(slot => `${slot.start}-${slot.end}`);
  console.log('🔷 Formatted slot strings:', slotsFormatted);

  const payload = {
    date: this.selectedDate,
    slots: slotsFormatted
  };

  const response = await firstValueFrom(this.availabilityService.setAvailability(payload));

  console.log('✅ Availability saved successfully:', response);

  this.showAvailabilityForm = false;
  this.resetForm();
  this.loadAvailability();
  this.loading = false;
}


  async loadAvailability() {
  
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
