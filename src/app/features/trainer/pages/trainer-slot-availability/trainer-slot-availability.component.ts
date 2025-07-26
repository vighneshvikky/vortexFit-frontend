import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TrainerSlotService } from '../../services/trainer-slot.service';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  type: 'initial' | 'one-on-one';
  isRecurring: boolean;
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  specificDate?: Date;
}

export interface DayAvailability {
  date: Date;
  slots: TimeSlot[];
  isRecurring: boolean;
}

@Component({
  selector: 'app-trainer-slot-availability',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    MatCheckboxModule
  ],
  templateUrl: './trainer-slot-availability.component.html',
  styleUrl: './trainer-slot-availability.component.scss'
})
export class TrainerSlotAvailabilityComponent implements OnInit {
  currentDate = new Date();
  selectedDate: Date | null = null;
  calendarDays: DayAvailability[] = [];
  slotForm: FormGroup;
  showSlotDialog = false;
  showDayModal = false;
  editingSlot: TimeSlot | null = null;
  selectedSlotType: 'initial' | 'one-on-one' = 'initial';
  isRecurringMode = false;
  selectedDaySlots: TimeSlot[] = [];

  readonly dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  readonly slotTypes = [
    { value: 'initial', label: 'Initial Consultation', description: 'Assess client fitness level and time preferences' },
    { value: 'one-on-one', label: 'One-on-One Session', description: 'Personalized training session' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private slotService: TrainerSlotService
  ) {
    this.slotForm = this.fb.group({
      startTime: ['09:00', Validators.required],
      endTime: ['10:00', Validators.required],
      type: ['initial', Validators.required],
      isRecurring: [false],
      dayOfWeek: [null],
      specificDate: [null]
    });
  }

  ngOnInit(): void {
    this.generateCalendar();
    this.subscribeToSlots();
  }

  private subscribeToSlots(): void {
    this.slotService.slots$.subscribe(() => {
      this.generateCalendar();
    });
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    this.calendarDays = this.generateCurrentMonthCalendar(year, month);
  }

  private generateCurrentMonthCalendar(year: number, month: number): DayAvailability[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendarDays: DayAvailability[] = [];
    const totalDays = Math.ceil((lastDay.getDate() + firstDay.getDay()) / 7) * 7;
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      calendarDays.push({
        date: new Date(date),
        slots: this.getSlotsForDate(date),
        isRecurring: this.hasRecurringSlots(date)
      });
    }
    
    return calendarDays;
  }

  getSlotsForDate(date: Date): TimeSlot[] {
    return this.slotService.getSlotsForDate(date);
  }

  hasRecurringSlots(date: Date): boolean {
    return this.slotService.hasRecurringSlots(date);
  }

  openDayModal(date: Date): void {
    this.selectedDate = date;
    this.selectedDaySlots = this.getSlotsForDate(date);
    this.showDayModal = true;
  }

  closeDayModal(): void {
    this.showDayModal = false;
    this.selectedDate = null;
    this.selectedDaySlots = [];
  }

  editSpecificDate(): void {
    if (this.selectedDate) {
      this.slotForm.patchValue({
        specificDate: this.selectedDate,
        dayOfWeek: this.selectedDate.getDay(),
        isRecurring: false
      });
      this.closeDayModal();
      this.showSlotDialog = true;
    }
  }

  editAllWeekdays(): void {
    if (this.selectedDate) {
      this.slotForm.patchValue({
        dayOfWeek: this.selectedDate.getDay(),
        isRecurring: true
      });
      this.closeDayModal();
      this.showSlotDialog = true;
    }
  }

  getDayName(dayIndex: number): string {
    return this.dayNames[dayIndex];
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    this.showSlotDialog = true;
    this.slotForm.patchValue({
      specificDate: date,
      dayOfWeek: date.getDay()
    });
  }

  openSlotDialog(slotType: 'initial' | 'one-on-one'): void {
    this.selectedSlotType = slotType;
    this.showSlotDialog = true;
    this.slotForm.patchValue({
      type: slotType,
      specificDate: this.selectedDate
    });
  }

  saveSlot(): void {
    if (this.slotForm.valid) {
      const formValue = this.slotForm.value;
      
      // Validate time
      if (!this.slotService.validateSlotTime(formValue.startTime, formValue.endTime)) {
        this.snackBar.open('End time must be after start time!', 'Close', { duration: 3000 });
        return;
      }

      const slotData = {
        startTime: formValue.startTime,
        endTime: formValue.endTime,
        type: formValue.type,
        isRecurring: formValue.isRecurring,
        dayOfWeek: formValue.isRecurring ? formValue.dayOfWeek : undefined,
        specificDate: formValue.isRecurring ? undefined : formValue.specificDate
      };

      // Check for overlapping slots
      if (this.slotService.checkSlotOverlap(slotData, this.editingSlot?.id)) {
        this.snackBar.open('This time slot conflicts with an existing slot!', 'Close', { duration: 3000 });
        return;
      }

      if (this.editingSlot) {
        // Update existing slot
        const updatedSlot = { ...this.editingSlot, ...slotData };
        this.slotService.updateSlot(updatedSlot);
        this.snackBar.open('Slot updated successfully!', 'Close', { duration: 3000 });
      } else {
        // Add new slot
        this.slotService.addSlot(slotData);
        this.snackBar.open('Slot saved successfully!', 'Close', { duration: 3000 });
      }
      
      this.closeSlotDialog();
    }
  }

  closeSlotDialog(): void {
    this.showSlotDialog = false;
    this.editingSlot = null;
    this.slotForm.reset({
      startTime: '09:00',
      endTime: '10:00',
      type: 'initial',
      isRecurring: false
    });
  }

  deleteSlot(slot: TimeSlot): void {
    this.slotService.deleteSlot(slot.id);
    this.snackBar.open('Slot deleted successfully!', 'Close', { duration: 3000 });
  }

  editSlot(slot: TimeSlot): void {
    this.editingSlot = slot;
    this.slotForm.patchValue({
      startTime: slot.startTime,
      endTime: slot.endTime,
      type: slot.type,
      isRecurring: slot.isRecurring,
      dayOfWeek: slot.dayOfWeek,
      specificDate: slot.specificDate
    });
    this.showSlotDialog = true;
  }

  setRecurringSlots(dayOfWeek: number): void {
    this.isRecurringMode = true;
    this.slotForm.patchValue({
      isRecurring: true,
      dayOfWeek: dayOfWeek
    });
    this.showSlotDialog = true;
  }

  getSlotTypeLabel(type: 'initial' | 'one-on-one'): string {
    return type === 'initial' ? 'Initial Consultation' : 'One-on-One Session';
  }

  getSlotTypeColor(type: 'initial' | 'one-on-one'): string {
    return type === 'initial' ? 'primary' : 'accent';
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentDate.getMonth();
  }

  previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  getMonthYearString(): string {
    return this.currentDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  }
}
