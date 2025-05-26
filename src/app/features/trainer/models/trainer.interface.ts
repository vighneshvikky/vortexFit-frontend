import { BaseAccount } from '../../auth/model/baseAccount.interface';

export interface Trainer  {
  _id: string;
  role: 'trainer';
  name?: string;
  email?: string;
  phoneNumber: string;
  specialization: string;
  experience: number;
  bio?: string;
  isBlocked?: boolean;
  isVerified?: boolean;
  idProofUrl?: string;
  certificationUrl?: string;
  verificationStatus:  'pending' | 'rejected' | 'approved';
  rejectionReason?: string;
  previousData?: any;
}
