import { Routes } from "@angular/router";
import { TrainerDashboardComponent } from "./pages/trainer-dashboard/trainer-dashboard.component";
import { roleGuard } from "../../core/guards/role.guard";

export const trainerRoutes: Routes = [
    {
        path: 'dashboard',
        component: TrainerDashboardComponent,
        canActivate: [roleGuard],
        data: { role: 'trainer' }
    }
]