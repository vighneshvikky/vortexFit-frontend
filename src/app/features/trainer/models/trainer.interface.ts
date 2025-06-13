

export interface Trainer {
  _id: string;
  name: string;
  email: string;
  role: 'trainer';
  isBlocked: boolean;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'requested';
  phoneNumber: string;
  specialization: string[];
  experience: number;
  bio?: string;
  certificationUrl?: string;
  idProofUrl?: string;
  rejectionReason?: string;
  rejectedAt?: Date;
  image: string;
  pricing: {
    oneToOneSession: number;
    workoutPlan: number;
  };
}
