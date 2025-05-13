import { BaseAccount } from "../../auth/model/baseAccount.interface";

export interface User extends BaseAccount {
   role: 'user'
  }
  