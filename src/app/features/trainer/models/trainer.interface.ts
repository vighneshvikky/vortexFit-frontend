import { BaseAccount } from '../../auth/model/baseAccount.interface';

export interface Trainer extends BaseAccount {
  role: 'trainer';
  name: string;
  phoneNumber: string;
  specialization: string;
  experience: number;
  bio?: string;
  idProofUrl?: string;
  certificationUrl?: string;
}
