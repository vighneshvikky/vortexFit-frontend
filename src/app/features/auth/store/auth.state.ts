import { Admin } from "../../admin/models/admin.interface";
import { User } from "../../admin/services/admin.service";
import { Trainer } from "../../trainer/models/trainer.interface";



export type AuthenticatedAccount = User | Trainer | Admin;

export interface AuthState {
  currentUser: AuthenticatedAccount | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}
