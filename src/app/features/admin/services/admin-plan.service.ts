import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../enviorments/environment";
import { API_ROUTES } from "../../../app.routes.constants";
import { SubscriptionPlan } from "../pages/admin-plan/admin-plan.component";

@Injectable({
    providedIn: 'root',
})

export class PlanService {
    private apiUrl = environment.api + API_ROUTES.PLANS.BASE;

    constructor(private http: HttpClient){
       
    };

    getPlans(): Observable<SubscriptionPlan[]>{
        console.log('dgtetrjewlkr');
        console.log('apri changin', this.apiUrl)
        return this.http.get<SubscriptionPlan[]>(this.apiUrl)
    }

   
createPlan(planData: any): Observable<SubscriptionPlan> {
    console.log('planData', planData);
    console.log('this.api', this.apiUrl)
    console.log('ajdklfajlkdj',`${this.apiUrl}${API_ROUTES.PLANS.CREATE}`)
  return this.http.post<SubscriptionPlan>(`${this.apiUrl}${API_ROUTES.PLANS.CREATE}`, planData);
}

updatePlan(planId: string, newPlan: Partial<SubscriptionPlan>): Observable<SubscriptionPlan>{
    return this.http.put<SubscriptionPlan>(`${this.apiUrl}${API_ROUTES.PLANS.UPDATE(planId)}`, newPlan)
}

getUserSpecificPlans(){
    return this.http.get<SubscriptionPlan[]>(`${this.apiUrl}${API_ROUTES.PLANS.GET_USER_SPECIFIC_PLAN}`)
}
}