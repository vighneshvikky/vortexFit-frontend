import { BaseAccount } from '../../auth/model/baseAccount.interface';

export interface Trainer extends BaseAccount {
  _id: string;
  role: 'trainer';
  name: string;
  phoneNumber: string;
  specialization: string;
  experience: number;
  bio?: string;
  isBlocked?: boolean;
  isVerified?: boolean;
  idProofUrl?: string;
  certificationUrl?: string;
  verificationStatus: 'not_submitted' | 'pending' | 'rejected' | 'approved';
  rejectionReason?: string;
  previousData?: any;
}
