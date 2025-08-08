export interface SchedulingRule {
  id?: string;
  trainerId?: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  bufferTime: number;
  sessionType: 'interactive' | 'one-to-one' | 'group' | 'other';
  isActive: boolean;
  daysOfWeek: number[];
  slotDuration: number;
  maxBookingsPerSlot?: number;
  exceptionalDays?: string[];
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  sessionType: 'interactive' | 'one-to-one' | 'group' | 'other';
  isActive: boolean;
  date: string;
  bufferTime: number;
  maxBookingsPerSlot?: number;
  currentBookings?: number;
}

export interface DaySlots {
  date: string;
  slots: TimeSlot[];
  hasRecurringSlots: boolean;
}

export interface SchedulingFormData {
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  bufferTime: number;
  sessionType: 'interactive' | 'one-to-one' | 'group' | 'other';
  daysOfWeek: number[];
  slotDuration: number;
  maxBookingsPerSlot?: number;
  exceptionalDays?: string[];
}
