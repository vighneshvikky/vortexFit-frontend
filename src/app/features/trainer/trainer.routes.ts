import { Routes } from "@angular/router";
import { TrainerDashboardComponent } from "./pages/trainer-dashboard/trainer-dashboard.component";

import { TrainerVerificationComponent } from "./pages/trainer-verification/trainer-verification.component";

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
    }
]