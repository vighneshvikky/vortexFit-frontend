import { Routes } from "@angular/router";
import { UserDashboardComponent } from "./pages/user-dashboard/user-dashboard.component";

export const userRoutes: Routes = [
    {path: 'dashboard', component: UserDashboardComponent}
]