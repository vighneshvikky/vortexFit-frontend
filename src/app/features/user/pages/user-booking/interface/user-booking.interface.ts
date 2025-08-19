export interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isAvailable: boolean;
  isSelected: boolean;
  fullDate: Date;
}

export interface TimeSlot {
  time: string;
  isBooked: boolean;
  isAvailable: boolean;
}

export interface SessionType {
  id: string;
  name: string;
  price: number;
  description: string;
}

// Interface for backend response
export interface TimeSlotsResponse {
  success: boolean;
  slots?: TimeSlot[];
  message?: string;
}