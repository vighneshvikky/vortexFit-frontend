import { AuthState } from "../features/auth/store/auth.state";
import { UsersState } from "./admin/users/users.reducer";


export interface AppState {
    auth: AuthState;
    users: UsersState
}