import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { SchedulingService } from '../../services/scheduling.service';
import {
  SchedulingRule,
  
} from '../../models/scheduling.interface';
import { NotyService } from '../../../../core/services/noty.service';
import {  DAYSOFWEEK, SESSION_TYPES } from '../../../../shared/constants/filter-options';

@Component({
  selector: 'app-trainer-scheduling',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './trainer-scheduling.component.html',
  styleUrl: './trainer-scheduling.component.scss',
})
export class TrainerSchedulingComponent implements OnInit, OnDestroy {
  schedulingForm: FormGroup;
  rules: SchedulingRule[] = [];
  showRuleForm: boolean = false;
  editingRule: SchedulingRule | null = null;
  exceptionalDaysInput: string = '';
  scheduleData: SchedulingRule[] = [];

  private subscriptions: Subscription[] = [];



    public sessionTypes = SESSION_TYPES;

  daysOfWeek = DAYSOFWEEK;

  constructor(
    private fb: FormBuilder,
    private schedulingService: SchedulingService,
    private notiservice: NotyService
  ) {
    this.schedulingForm = this.createForm();
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.schedulingService.getSchedule().subscribe({
        next: (res: SchedulingRule[]) => {
          console.log('res', res);
          this.scheduleData = res;
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  createForm(): FormGroup {
    return this.fb.group({
      startTime: ['09:00', [Validators.required]],
      endTime: ['17:00', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      bufferTime: [
        15,
        [Validators.required, Validators.min(0), Validators.max(60)],
      ],
      sessionType: ['one-to-one', [Validators.required]],
      daysOfWeek: [
        [1, 2, 3, 4, 5],
        [Validators.required, Validators.minLength(1)],
      ],
      slotDuration: [
        60,
        [Validators.required, Validators.min(15), Validators.max(240)],
      ],
      maxBookingsPerSlot: [1, [Validators.min(1), Validators.max(10)]],
      exceptionalDays: [[]],
      exceptionalDayInput: [''],
    });
  }

  onSubmit(): void {
    if (this.schedulingForm.valid) {
      const formData: SchedulingRule = this.schedulingForm.value;

      this.schedulingService.addSlotRule(formData).subscribe({
        next: (res: SchedulingRule) => {
          if (!this.scheduleData) {
            this.scheduleData = [];
          }
          this.scheduleData.push(res);
          this.notiservice.showSuccess('Scheduling rule added successfully.');
        },
        error: (err) => {
          this.notiservice.showError(err.error.message);
        },
      });

      this.showRuleForm = false;
      this.resetForm();
    }
  }


  onDeleteRule(ruleId: string): void {
    this.schedulingService.deleteSchedule(ruleId).subscribe({
      next: () => {
        this.scheduleData = this.scheduleData.filter(
          (rul) => rul.id !== ruleId
        );
        this.notiservice.showSuccess('Schedule rule deleted successfully');
      },
      error: (err) => {
        this.notiservice.showError(err.error.message);
      },
    });
  }

  onDayOfWeekChange(day: number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const isChecked = inputElement.checked;

    const control = this.schedulingForm.get('daysOfWeek');
    if (!control) return;

    const currentDays: number[] = control.value || [];

    if (isChecked && !currentDays.includes(day)) {
      control.setValue([...currentDays, day]);
    } else if (!isChecked && currentDays.includes(day)) {
      control.setValue(currentDays.filter((d) => d !== day));
    }

    // Optional: trigger validation updates
    control.markAsDirty();
    control.updateValueAndValidity();
  }



  addExceptionalDay(): void {
    const inputControl = this.schedulingForm.get('exceptionalDayInput');
    const inputValue: string = inputControl?.value;

    if (inputValue && inputValue.trim()) {
      const currentDays: string[] =
        this.schedulingForm.get('exceptionalDays')?.value || [];


      if (!currentDays.includes(inputValue)) {
        const updatedDays = [...currentDays, inputValue];

        this.schedulingForm.patchValue({
          exceptionalDays: updatedDays,
          exceptionalDayInput: '',
        });

        
        this.schedulingForm.get('exceptionalDays')?.markAsDirty();
      }
    }
  }

  removeExceptionalDay(date: string): void {
    const currentDays = this.schedulingForm.get('exceptionalDays')?.value || [];
    this.schedulingForm.patchValue({
      exceptionalDays: currentDays.filter((d: string) => d !== date),
    });
  }

  getDayName(dayOfWeek: number): string {
    return this.daysOfWeek.find((day) => day.value === dayOfWeek)?.label || '';
  }

  getSessionTypeLabel(type: string): string {
    const sessionType = this.sessionTypes.find(
      (session) => session.value === type
    );
    return sessionType ? sessionType.label : type;
  }

  formatTime(time: string): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  getDaysOfWeekString(days: number[] | undefined): string {
    if (!days || !Array.isArray(days)) {
      return 'No days selected';
    }

    if (days.length === 0) {
      return 'No days selected';
    }

    return days
      .map((day: number) => this.getDayName(day))
      .filter((name) => name)
      .join(', ');
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  cancelEdit(): void {
    this.showRuleForm = false;
    this.editingRule = null;
    this.resetForm();
  }

  private resetForm(): void {
    this.schedulingForm.reset({
      startTime: '09:00',
      endTime: '17:00',
      startDate: '',
      endDate: '',
      bufferTime: 15,
      sessionType: 'one-to-one',
      daysOfWeek: [1, 2, 3, 4, 5],
      slotDuration: 60,
      maxBookingsPerSlot: 1,
      exceptionalDays: [],
      exceptionalDayInput: '', 
    });
  }
}
