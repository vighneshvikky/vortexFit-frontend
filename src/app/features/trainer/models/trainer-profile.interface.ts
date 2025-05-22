export interface TrainerProfile {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  experience: number;
  bio: string;
  idProofUrl: string;
  certificationUrl: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  createdAt?: string;  
  updatedAt?: string;
}
