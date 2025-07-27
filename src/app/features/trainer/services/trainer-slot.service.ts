import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TimeSlot, DayAvailability } from '../pages/trainer-slot-availability/trainer-slot-availability.component';

@Injectable({
  providedIn: 'root'
})
export class TrainerSlotService {
  private slotsSubject = new BehaviorSubject<TimeSlot[]>([]);
  public slots$ = this.slotsSubject.asObservable();

  constructor() {
    this.loadSlotsFromStorage();
  }

  // Get all slots
  getSlots(): TimeSlot[] {
    return this.slotsSubject.value;
  }

  // Get active slots only
  getActiveSlots(): TimeSlot[] {
    return this.slotsSubject.value.filter(slot => slot.isActive);
  }

  // Add a new slot
  addSlot(slot: Omit<TimeSlot, 'id'>): TimeSlot {
    const newSlot: TimeSlot = {
      ...slot,
      id: this.generateId(),
      isActive: slot.isActive !== undefined ? slot.isActive : true
    };
    
    const currentSlots = this.slotsSubject.value;
    const updatedSlots = [...currentSlots, newSlot];
    this.slotsSubject.next(updatedSlots);
    this.saveSlotsToStorage(updatedSlots);
    
    return newSlot;
  }

  // Update an existing slot
  updateSlot(updatedSlot: TimeSlot): TimeSlot {
    const currentSlots = this.slotsSubject.value;
    const updatedSlots = currentSlots.map(slot => 
      slot.id === updatedSlot.id ? updatedSlot : slot
    );
    this.slotsSubject.next(updatedSlots);
    this.saveSlotsToStorage(updatedSlots);
    
    return updatedSlot;
  }

  // Delete a slot
  deleteSlot(slotId: string): void {
    const currentSlots = this.slotsSubject.value;
    const updatedSlots = currentSlots.filter(slot => slot.id !== slotId);
    this.slotsSubject.next(updatedSlots);
    this.saveSlotsToStorage(updatedSlots);
  }

  // Clear all slots
  clearAllSlots(): void {
    this.slotsSubject.next([]);
    this.saveSlotsToStorage([]);
  }

  // Get slots for a specific date (only active slots)
  getSlotsForDate(date: Date): TimeSlot[] {
    const dayOfWeek = date.getDay();
    const dateString = this.formatDate(date);
    
    return this.slotsSubject.value.filter(slot => {
      if (!slot.isActive) return false;
      
      if (slot.isRecurring) {
        return slot.dayOfWeek === dayOfWeek;
      } else {
        return slot.specificDate && this.formatDate(slot.specificDate) === dateString;
      }
    });
  }

  // Get recurring slots for a specific day of week (only active slots)
  getRecurringSlotsForDay(dayOfWeek: number): TimeSlot[] {
    return this.slotsSubject.value.filter(slot => 
      slot.isRecurring && slot.dayOfWeek === dayOfWeek && slot.isActive
    );
  }

  // Get slots by type (only active slots)
  getSlotsByType(type: 'initial' | 'one-on-one' | 'group'): TimeSlot[] {
    return this.slotsSubject.value.filter(slot => slot.type === type && slot.isActive);
  }

  // Check if a date has recurring slots (only active slots)
  hasRecurringSlots(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return this.slotsSubject.value.some(slot => 
      slot.isRecurring && slot.dayOfWeek === dayOfWeek && slot.isActive
    );
  }

  // Generate calendar data for a month
  generateCalendarData(year: number, month: number): DayAvailability[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendarDays: DayAvailability[] = [];
    
    for (let i = 0; i < 42; i++) {
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

  // Validate slot time
  validateSlotTime(startTime: string, endTime: string): boolean {
    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);
    return start < end;
  }

  // Check for overlapping slots (only active slots)
  checkSlotOverlap(newSlot: Omit<TimeSlot, 'id'>, excludeSlotId?: string): boolean {
    const currentSlots = this.slotsSubject.value.filter(slot => 
      slot.isActive && (excludeSlotId ? slot.id !== excludeSlotId : true)
    );

    return currentSlots.some(existingSlot => {
      // Check if slots are for the same day
      if (newSlot.isRecurring && existingSlot.isRecurring) {
        if (newSlot.dayOfWeek !== existingSlot.dayOfWeek) return false;
      } else if (!newSlot.isRecurring && !existingSlot.isRecurring) {
        if (!newSlot.specificDate || !existingSlot.specificDate) return false;
        if (this.formatDate(newSlot.specificDate) !== this.formatDate(existingSlot.specificDate)) return false;
      } else {
        return false; // One is recurring, one is not
      }

      // Check time overlap
      const newStart = this.parseTime(newSlot.startTime);
      const newEnd = this.parseTime(newSlot.endTime);
      const existingStart = this.parseTime(existingSlot.startTime);
      const existingEnd = this.parseTime(existingSlot.endTime);

      return (newStart < existingEnd && newEnd > existingStart);
    });
  }

  // Get available time slots for a specific date
  getAvailableTimeSlots(date: Date, duration: number = 60): string[] {
    const dayOfWeek = date.getDay();
    const dateString = this.formatDate(date);
    const existingSlots = this.getSlotsForDate(date);
    
    const availableSlots: string[] = [];
    const startHour = 6; // 6 AM
    const endHour = 22; // 10 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) { // 30-minute intervals
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endTime = this.addMinutes(startTime, duration);
        
        // Check if this time slot conflicts with existing slots
        const conflicts = existingSlots.some(slot => {
          const slotStart = this.parseTime(slot.startTime);
          const slotEnd = this.parseTime(slot.endTime);
          const proposedStart = this.parseTime(startTime);
          const proposedEnd = this.parseTime(endTime);
          
          return (proposedStart < slotEnd && proposedEnd > slotStart);
        });
        
        if (!conflicts) {
          availableSlots.push(startTime);
        }
      }
    }
    
    return availableSlots;
  }

  // Toggle slot active status
  toggleSlotActive(slotId: string): TimeSlot | null {
    const currentSlots = this.slotsSubject.value;
    const slotIndex = currentSlots.findIndex(slot => slot.id === slotId);
    
    if (slotIndex === -1) return null;
    
    const updatedSlot = {
      ...currentSlots[slotIndex],
      isActive: !currentSlots[slotIndex].isActive
    };
    
    const updatedSlots = [...currentSlots];
    updatedSlots[slotIndex] = updatedSlot;
    
    this.slotsSubject.next(updatedSlots);
    this.saveSlotsToStorage(updatedSlots);
    
    return updatedSlot;
  }

  // Get slot statistics
  getSlotStatistics(): {
    total: number;
    active: number;
    inactive: number;
    byType: { [key: string]: number };
  } {
    const slots = this.slotsSubject.value;
    const stats = {
      total: slots.length,
      active: slots.filter(slot => slot.isActive).length,
      inactive: slots.filter(slot => !slot.isActive).length,
      byType: {
        initial: slots.filter(slot => slot.type === 'initial').length,
        'one-on-one': slots.filter(slot => slot.type === 'one-on-one').length,
        group: slots.filter(slot => slot.type === 'group').length
      }
    };
    
    return stats;
  }

  // Private helper methods
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private addMinutes(timeString: string, minutes: number): string {
    const totalMinutes = this.parseTime(timeString) + minutes;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private saveSlotsToStorage(slots: TimeSlot[]): void {
    try {
      localStorage.setItem('trainer-slots', JSON.stringify(slots));
    } catch (error) {
      console.error('Error saving slots to storage:', error);
    }
  }

  private loadSlotsFromStorage(): void {
    try {
      const storedSlots = localStorage.getItem('trainer-slots');
      if (storedSlots) {
        const slots = JSON.parse(storedSlots);
        // Convert date strings back to Date objects and ensure isActive property exists
        const parsedSlots = slots.map((slot: any) => ({
          ...slot,
          isActive: slot.isActive !== undefined ? slot.isActive : true,
          specificDate: slot.specificDate ? new Date(slot.specificDate) : undefined
        }));
        this.slotsSubject.next(parsedSlots);
      }
    } catch (error) {
      console.error('Error loading slots from storage:', error);
    }
  }
} 