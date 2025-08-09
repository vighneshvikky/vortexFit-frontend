import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Trainer } from '../../../trainer/models/trainer.interface';
import { UserService } from '../../services/user.service';
import { NotyService } from '../../../../core/services/noty.service';

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
  standalone: true
})
export class UserBookingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private notyf = inject(NotyService);

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

  // Time slots
  selectedTimeSlot: TimeSlot | null = null;
  availableTimeSlots: TimeSlot[] = [];

  // Confirmation modal
  showConfirmationModal: boolean = false;
  bookingId: string = '';

  ngOnInit() {
    this.trainerId = this.route.snapshot.paramMap.get('id') || '';
    if (this.trainerId) {
      this.fetchTrainerData();
    } else {
      this.notyf.showError('Trainer ID not found');
      this.router.navigate(['/user/dashboard']);
    }
  }

  // Fetch trainer data from backend
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
      }
    });
  }

  // Initialize session types based on trainer pricing
  initializeSessionTypes() {
    if (this.trainer?.pricing) {
      this.sessionTypes = [
        {
          id: 'one-to-one',
          name: 'One-to-One Session',
          price: this.trainer.pricing.oneToOneSession,
          description: 'Personalized training session with warm-up, workout & cool-down'
        },
        {
          id: 'workout-plan',
          name: 'Workout Plan',
          price: this.trainer.pricing.workoutPlan,
          description: 'Custom plan for you to follow independently'
        }
      ];
    }
  }

  // Session type selection
  selectSessionType(type: string) {
    this.selectedSessionType = type;
  }

  getSessionTypeName(): string {
    const session = this.sessionTypes.find(s => s.id === this.selectedSessionType);
    return session ? session.name : '';
  }

  getSessionPrice(): number {
    const session = this.sessionTypes.find(s => s.id === this.selectedSessionType);
    return session ? session.price : 0;
  }

  // Calendar functionality
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
        fullDate: new Date(currentDate)
      });
    }
  }

  isDateAvailable(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    // Available on weekdays (Monday-Friday) and not in the past
    const dayOfWeek = date.getDay();
    return checkDate >= today && dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  selectDate(day: CalendarDay) {
    if (!day.isAvailable || !day.isCurrentMonth) return;
    
    // Clear previous selection
    this.calendarDays.forEach(d => d.isSelected = false);
    day.isSelected = true;
    
    // Set selected date
    this.selectedDate = day.fullDate;
    
    // Reset time slot selection
    this.selectedTimeSlot = null;
    
    // Generate time slots for selected date
    this.generateTimeSlots(day.fullDate);
  }

  generateTimeSlots(selectedDate: Date) {
    // Mock time slots - in real app, this would come from backend
    const slots = [
      { time: '09:00 AM', isBooked: false, isAvailable: true },
      { time: '10:00 AM', isBooked: false, isAvailable: true },
      { time: '11:00 AM', isBooked: true, isAvailable: false },
      { time: '12:00 PM', isBooked: false, isAvailable: true },
      { time: '02:00 PM', isBooked: false, isAvailable: true },
      { time: '03:00 PM', isBooked: false, isAvailable: true },
      { time: '04:00 PM', isBooked: true, isAvailable: false },
      { time: '05:00 PM', isBooked: false, isAvailable: true },
      { time: '06:00 PM', isBooked: false, isAvailable: true }
    ];

    // Filter available slots based on selected date
    this.availableTimeSlots = slots.filter(slot => slot.isAvailable);
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
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    this.currentMonthYear = this.currentDate.toLocaleDateString('en-US', options);
  }

  // Time slot selection
  selectTimeSlot(slot: TimeSlot) {
    if (!slot.isAvailable || slot.isBooked) return;
    this.selectedTimeSlot = slot;
  }

  // Booking confirmation
  confirmBooking() {
    if (!this.selectedSessionType || !this.selectedDate || !this.selectedTimeSlot) {
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
    return this.trainer?.experience ? `${this.trainer.experience} years experience` : 'Experience not specified';
  }

  getTrainerBio(): string {
    return this.trainer?.bio || 'No bio available';
  }
}
