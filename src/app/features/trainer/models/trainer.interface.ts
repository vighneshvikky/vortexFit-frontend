import { BaseAccount } from '../../auth/model/baseAccount.interface';

export interface Trainer extends BaseAccount {
  role: 'trainer';
}
