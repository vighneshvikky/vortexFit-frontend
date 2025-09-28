import { User } from "../../admin/services/admin.service";
import { Trainer } from "../../trainer/models/trainer.interface";



export type AuthenticatedAccount = User | Trainer;
