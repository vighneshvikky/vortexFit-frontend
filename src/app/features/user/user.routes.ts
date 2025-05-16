import { Routes } from "@angular/router";
import { UserDashboardComponent } from "./pages/user-dashboard/user-dashboard.component";
// import { roleGuard } from "../../core/guards/role.guard";

export const userRoutes: Routes = [
    {
        path: 'dashboard',
        component: UserDashboardComponent,

        data: { role: 'user' }
    }
]