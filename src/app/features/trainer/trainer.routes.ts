import { Routes } from "@angular/router";
import { TrainerDashboardComponent } from "./pages/trainer-dashboard/trainer-dashboard.component";
import { TrainerVerificationComponent } from "./pages/trainer-verification/trainer-verification.component";
import { TrainerStatusComponent } from "./pages/trainer-status/trainer-status.component";

export const trainerRoutes: Routes = [
    {
        path: 'dashboard',
        component: TrainerDashboardComponent,
        data: { role: 'trainer' }
    },
    {
        path: 'trainer-requests',
        component: TrainerVerificationComponent,
        data: { role: 'trainer' }
    },
    // {
    //     path: 'trainer-status',
    //     component: TrainerStatusComponent,
    //     data: { role: 'trainer' }
    // }
]