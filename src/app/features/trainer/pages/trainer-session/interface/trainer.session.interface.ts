export interface BookingSession {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  trainerId: string;
  date: string;          
  timeSlot: string;     
  status: "pending" | "confirmed" | "cancelled" | string;
  amount: number;
  currency: string;      
  paymentId: string;
  orderId: string;
  sessionType: "one-to-one" | "group" | string;
  paymentSignature: string;
  createdAt: string;     
  updatedAt: string;     
  __v: number;
}


export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  FAILED = 'failed'
}
