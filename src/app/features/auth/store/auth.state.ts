import { Trainer } from "../../trainer/models/trainer.interface";
import { User } from "../../user/models/user.interface";


export type AuthenticatedAccount = User | Trainer;

export interface AuthState {
  currentUser: AuthenticatedAccount | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}
