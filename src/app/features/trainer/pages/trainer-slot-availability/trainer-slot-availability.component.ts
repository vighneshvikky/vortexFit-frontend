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
  type: 'initial' | 'one-on-one' | 'group';
  isRecurring: boolean;
  isActive: boolean;
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  specificDate?: Date;
}

export interface DayAvailability {
  date: Date;
  slots: TimeSlot[];
  isRecurring: boolean;
}

export interface TimeConfiguration {
  startTime: string;
  endTime: string;
  sessionType: 'initial' | 'one-on-one' | 'group';
  sessionDuration: number;
  breakDuration: number;
  breakStartTime: string;
  selectedDays: number[];
}

export interface GeneratedSlot {
  startTime: string;
  endTime: string;
  type: 'initial' | 'one-on-one' | 'group';
  isBreak: boolean;
}

export interface DynamicSlotConfig {
  initialSessionDuration: number;
  oneOnOneSessionDuration: number;
  breakDuration: number;
  workingHours: {
    start: string;
    end: string;
  };
  daysOfWeek: number[];
  autoGenerate: boolean;
  generateInitialSessions: boolean;
  generateOneOnOneSessions: boolean;
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
  
  // Forms
  dynamicConfigForm!: FormGroup;
  timeConfigForm!: FormGroup;
  
  // Data
  currentMonth: Date = new Date();
  calendarDays: DayAvailability[] = [];
  generatedSlots: GeneratedSlot[] = [];
  previewSlots: GeneratedSlot[] = [];
  selectedDay: DayAvailability | null = null;
  
  // Configuration
  dynamicConfig: DynamicSlotConfig = {
    initialSessionDuration: 30,
    oneOnOneSessionDuration: 60,
    breakDuration: 15,
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    autoGenerate: true,
    generateInitialSessions: true,
    generateOneOnOneSessions: true
  };
  
  // UI State
  showConfigPanel = false;
  showPreview = false;
  isLoading = false;
  
  // Days of week for UI
  daysOfWeek = [
    { value: 0, label: 'Sunday', short: 'Sun' },
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' }
  ];

  constructor(
    private fb: FormBuilder,
    private trainerSlotService: TrainerSlotService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadDynamicConfig();
    this.generateCalendarData();
    this.loadSlots();
    
    // Auto-generate slots if enabled
    if (this.dynamicConfig.autoGenerate) {
      this.autoGenerateSlots();
    }
  }

  private initializeForms(): void {
    this.dynamicConfigForm = this.fb.group({
      initialSessionDuration: [30, [Validators.required, Validators.min(15), Validators.max(120)]],
      oneOnOneSessionDuration: [60, [Validators.required, Validators.min(30), Validators.max(180)]],
      breakDuration: [15, [Validators.required, Validators.min(5), Validators.max(60)]],
      workingHoursStart: ['09:00', Validators.required],
      workingHoursEnd: ['17:00', Validators.required],
      selectedDays: [[1, 2, 3, 4, 5], Validators.required],
      autoGenerate: [true],
      generateInitialSessions: [true],
      generateOneOnOneSessions: [true]
    });

    this.timeConfigForm = this.fb.group({
      startTime: ['09:00', Validators.required],
      endTime: ['17:00', Validators.required],
      sessionType: ['one-on-one', Validators.required],
      sessionDuration: [60, [Validators.required, Validators.min(15)]],
      breakDuration: [15, [Validators.required, Validators.min(5)]],
      breakStartTime: ['12:00', Validators.required],
      selectedDays: [[1, 2, 3, 4, 5], Validators.required]
    });
  }

  private loadDynamicConfig(): void {
    const stored = localStorage.getItem('dynamic-slot-config');
    if (stored) {
      this.dynamicConfig = { ...this.dynamicConfig, ...JSON.parse(stored) };
      this.dynamicConfigForm.patchValue({
        initialSessionDuration: this.dynamicConfig.initialSessionDuration,
        oneOnOneSessionDuration: this.dynamicConfig.oneOnOneSessionDuration,
        breakDuration: this.dynamicConfig.breakDuration,
        workingHoursStart: this.dynamicConfig.workingHours.start,
        workingHoursEnd: this.dynamicConfig.workingHours.end,
        selectedDays: this.dynamicConfig.daysOfWeek,
        autoGenerate: this.dynamicConfig.autoGenerate,
        generateInitialSessions: this.dynamicConfig.generateInitialSessions,
        generateOneOnOneSessions: this.dynamicConfig.generateOneOnOneSessions
      });
    }
  }

  private saveDynamicConfig(): void {
    const formValue = this.dynamicConfigForm.value;
    this.dynamicConfig = {
      initialSessionDuration: formValue.initialSessionDuration,
      oneOnOneSessionDuration: formValue.oneOnOneSessionDuration,
      breakDuration: formValue.breakDuration,
      workingHours: {
        start: formValue.workingHoursStart,
        end: formValue.workingHoursEnd
      },
      daysOfWeek: formValue.selectedDays,
      autoGenerate: formValue.autoGenerate,
      generateInitialSessions: formValue.generateInitialSessions,
      generateOneOnOneSessions: formValue.generateOneOnOneSessions
    };
    
    localStorage.setItem('dynamic-slot-config', JSON.stringify(this.dynamicConfig));
  }

  private generateCalendarData(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    this.calendarDays = this.trainerSlotService.generateCalendarData(year, month);
  }

  private loadSlots(): void {
    // Load existing slots from service
    this.trainerSlotService.slots$.subscribe(slots => {
      // Update calendar data when slots change
      this.generateCalendarData();
    });
  }

  // Auto-generate slots for all configured days
  autoGenerateSlots(): void {
    this.isLoading = true;
    
    try {
      // Clear existing recurring slots
      this.clearExistingRecurringSlots();
      
      // Generate slots for each configured day
      this.dynamicConfig.daysOfWeek.forEach(dayOfWeek => {
        this.generateSlotsForDay(dayOfWeek);
      });
      
      this.snackBar.open('Dynamic slots generated successfully!', 'Close', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Error generating slots', 'Close', { duration: 3000 });
      console.error('Error generating slots:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private clearExistingRecurringSlots(): void {
    const currentSlots = this.trainerSlotService.getSlots();
    const nonRecurringSlots = currentSlots.filter(slot => !slot.isRecurring);
    
    // Clear all slots and restore only non-recurring ones
    this.trainerSlotService.clearAllSlots();
    nonRecurringSlots.forEach(slot => {
      this.trainerSlotService.addSlot(slot);
    });
  }

  private generateSlotsForDay(dayOfWeek: number): void {
    const { start, end } = this.dynamicConfig.workingHours;
    const breakDuration = this.dynamicConfig.breakDuration;
    
    // Generate initial consultation slots if enabled
    if (this.dynamicConfig.generateInitialSessions) {
      this.generateSlotsForSessionType(dayOfWeek, start, end, breakDuration, 'initial', this.dynamicConfig.initialSessionDuration);
    }
    
    // Generate one-on-one training slots if enabled
    if (this.dynamicConfig.generateOneOnOneSessions) {
      this.generateSlotsForSessionType(dayOfWeek, start, end, breakDuration, 'one-on-one', this.dynamicConfig.oneOnOneSessionDuration);
    }
  }

  private generateSlotsForSessionType(
    dayOfWeek: number, 
    startTime: string, 
    endTime: string, 
    breakDuration: number, 
    sessionType: 'initial' | 'one-on-one', 
    sessionDuration: number
  ): void {
    const slots: Omit<TimeSlot, 'id'>[] = [];
    let currentTime = this.parseTime(startTime);
    const endMinutes = this.parseTime(endTime);
    
    while (currentTime + sessionDuration <= endMinutes) {
      const slotStart = this.formatTime(currentTime);
      const slotEnd = this.formatTime(currentTime + sessionDuration);
      
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        type: sessionType,
        isRecurring: true,
        isActive: true,
        dayOfWeek: dayOfWeek
      });
      
      // Move to next slot (add break duration gap between sessions)
      currentTime += sessionDuration + breakDuration;
    }
    
    // Add all generated slots
    slots.forEach(slot => {
      this.trainerSlotService.addSlot(slot);
    });
  }

  // Preview generated slots before applying
  previewGeneratedSlots(): void {
    this.previewSlots = [];
    const { start, end } = this.dynamicConfig.workingHours;
    const breakDuration = this.dynamicConfig.breakDuration;
    
    // Generate preview for Monday (example day)
    this.generatePreviewSlots(1, start, end, breakDuration);
    this.showPreview = true;
  }

  private generatePreviewSlots(
    dayOfWeek: number, 
    startTime: string, 
    endTime: string, 
    breakDuration: number
  ): void {
    let currentTime = this.parseTime(startTime);
    const endMinutes = this.parseTime(endTime);
    
    // Generate initial consultation slots if enabled
    if (this.dynamicConfig.generateInitialSessions) {
      currentTime = this.parseTime(startTime);
      while (currentTime + this.dynamicConfig.initialSessionDuration <= endMinutes) {
        const slotStart = this.formatTime(currentTime);
        const slotEnd = this.formatTime(currentTime + this.dynamicConfig.initialSessionDuration);
        
        this.previewSlots.push({
          startTime: slotStart,
          endTime: slotEnd,
          type: 'initial',
          isBreak: false
        });
        
        currentTime += this.dynamicConfig.initialSessionDuration + breakDuration;
      }
    }
    
    // Generate one-on-one training slots if enabled
    if (this.dynamicConfig.generateOneOnOneSessions) {
      currentTime = this.parseTime(startTime);
      while (currentTime + this.dynamicConfig.oneOnOneSessionDuration <= endMinutes) {
        const slotStart = this.formatTime(currentTime);
        const slotEnd = this.formatTime(currentTime + this.dynamicConfig.oneOnOneSessionDuration);
        
        this.previewSlots.push({
          startTime: slotStart,
          endTime: slotEnd,
          type: 'one-on-one',
          isBreak: false
        });
        
        currentTime += this.dynamicConfig.oneOnOneSessionDuration + breakDuration;
      }
    }
  }

  // Apply dynamic configuration
  applyDynamicConfig(): void {
    if (this.dynamicConfigForm.valid) {
      this.saveDynamicConfig();
      
      if (this.dynamicConfig.autoGenerate) {
        this.autoGenerateSlots();
      }
      
      this.showConfigPanel = false;
      this.snackBar.open('Configuration applied successfully!', 'Close', { duration: 3000 });
    }
  }

  // Toggle slot active status
  toggleSlotActive(slot: TimeSlot): void {
    this.trainerSlotService.toggleSlotActive(slot.id);
  }

  // Delete slot
  deleteSlot(slot: TimeSlot): void {
    this.trainerSlotService.deleteSlot(slot.id);
    this.snackBar.open('Slot deleted successfully!', 'Close', { duration: 3000 });
  }

  // Navigate calendar
  previousMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendarData();
  }

  nextMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generateCalendarData();
  }

  // Get day name
  getDayName(dayOfWeek: number): string {
    return this.daysOfWeek.find(day => day.value === dayOfWeek)?.short || '';
  }

  // Get slot type color
  getSlotTypeColor(type: string): string {
    switch (type) {
      case 'initial': return 'primary';
      case 'one-on-one': return 'accent';
      case 'group': return 'warn';
      default: return 'primary';
    }
  }

  // Utility methods
  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Form getters
  get dynamicConfigFormControls() {
    return this.dynamicConfigForm.controls;
  }

  get timeConfigFormControls() {
    return this.timeConfigForm.controls;
  }

  // Day selection methods
  toggleDaySelection(dayValue: number, checked: boolean): void {
    const currentDays = this.dynamicConfigFormControls['selectedDays'].value || [];
    if (checked) {
      if (!currentDays.includes(dayValue)) {
        this.dynamicConfigFormControls['selectedDays'].setValue([...currentDays, dayValue]);
      }
    } else {
      this.dynamicConfigFormControls['selectedDays'].setValue(currentDays.filter((day: number) => day !== dayValue));
    }
  }

  selectAllDays(): void {
    const allDays = this.daysOfWeek.map(day => day.value);
    this.dynamicConfigFormControls['selectedDays'].setValue(allDays);
  }

  clearAllDays(): void {
    this.dynamicConfigFormControls['selectedDays'].setValue([]);
  }

  // Calendar methods
  getCalendarWeeks(): DayAvailability[][] {
    const weeks: DayAvailability[][] = [];
    let currentWeek: DayAvailability[] = [];
    
    this.calendarDays.forEach((day, index) => {
      currentWeek.push(day);
      
      if ((index + 1) % 7 === 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return weeks;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  selectDay(day: DayAvailability): void {
    this.selectedDay = day;
  }

  getSlotCountByType(slots: TimeSlot[], type: string): number {
    return slots.filter(slot => slot.type === type).length;
  }

  // Clear all slots
  clearAllSlots(): void {
    this.trainerSlotService.clearAllSlots();
    this.snackBar.open('All slots cleared successfully!', 'Close', { duration: 3000 });
  }
}
