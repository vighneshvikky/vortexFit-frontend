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

export interface TimeSlotsResponse {
  success: boolean;
  slots?: TimeSlot[];
  message?: string;
}

export interface SessionBookingRequest {
  trainerId: string;
  amount: number;
  sessionType: 'one-to-one' | 'group' | string;
  date: string;
  timeSlot: string | TimeSlot;
}

export interface PaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  trainerId: string;
  sessionType: 'one-to-one' | 'group' | string;
  date: string;
  timeSlot: string | null | TimeSlot;
  amount: number;
}

export interface RazorpayPaymentFailedResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  };
}
