export interface SchedulingRule {
  id?: string;
  startTime: string;
  endTime: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  bufferTime: number; // in minutes
  sessionType: 'interactive' | 'one-to-one' | 'group' | 'other';
  isActive: boolean;
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  slotDuration: number; // in minutes
  maxBookingsPerSlot?: number;
  exceptionalDays?: string[]; // Array of dates in YYYY-MM-DD format to exclude
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