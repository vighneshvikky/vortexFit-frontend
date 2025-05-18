import { Admin } from "../../../features/admin/models/admin.interface";
import { User } from "../../../features/admin/services/admin.service";
import { Trainer } from "../../../features/trainer/models/trainer.interface";


export type LoginResponse = User | Trainer

export type AdminResponse = Admin
  

  
