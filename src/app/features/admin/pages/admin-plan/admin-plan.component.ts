import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanService } from '../../services/admin-plan.service';

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  isActive: boolean;
  features: string[];
  trialPeriod?: number;
  role: 'user' | 'trainer';
  limits: {
    oneOnOneSessions: number | 'unlimited';
    aiQueries: number | 'unlimited';
    chatAccess: boolean;
    videoAccess: boolean;
    communityAccess: boolean;
    prioritySupport: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-admin-plan',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-plan.component.html',
  styleUrl: './admin-plan.component.scss',
})
export class AdminPlanComponent implements OnInit {
  plans: SubscriptionPlan[] = [];

  showAddPlanModal = false;
  editingPlan: SubscriptionPlan | null = null;

  newPlan: Partial<SubscriptionPlan> = {
    name: '',
    description: '',
    price: 0,
    billingCycle: 'monthly',
    role: 'user', // Default role
    features: [],
    limits: {
      oneOnOneSessions: 0,
      aiQueries: 0,
      chatAccess: false,
      videoAccess: false,
      communityAccess: false,
      prioritySupport: false,
    },
  };

  constructor(private adminPlanService: PlanService) {
    console.log('AdminPlanComponent initialized');
  }

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.adminPlanService.getPlans().subscribe({
      next: (data) => {
        console.log('Plans loaded:', data);
        this.plans = data;
      },
      error: (error) => {
        console.error('Error loading plans:', error);
      }
    });
  }

  openAddPlanModal(): void {
    this.showAddPlanModal = true;
    this.editingPlan = null;
    this.resetNewPlan();
  }

  openEditPlan(plan: SubscriptionPlan): void {
    this.editingPlan = plan;
    this.showAddPlanModal = true;
    // Deep copy the plan to avoid modifying the original
    this.newPlan = {
      ...plan,
      features: [...plan.features],
      limits: { ...plan.limits }
    };
  }

  closeModal(): void {
    this.showAddPlanModal = false;
    this.editingPlan = null;
    this.resetNewPlan();
  }

  resetNewPlan(): void {
    this.newPlan = {
      name: '',
      description: '',
      price: 0,
      billingCycle: 'monthly',
      role: 'user', // Default role
      features: [],
      limits: {
        oneOnOneSessions: 0,
        aiQueries: 0,
        chatAccess: false,
        videoAccess: false,
        communityAccess: false,
        prioritySupport: false,
      },
    };
  }

  savePlan(): void {
    // Validate required fields
    if (!this.newPlan.name || !this.newPlan.description || this.newPlan.price === undefined) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Saving plan:', this.newPlan);

    if (this.editingPlan) {
      this.adminPlanService.updatePlan(this.editingPlan._id, this.newPlan).subscribe({
        next: (updatedPlan) => {
          console.log('Plan updated:', updatedPlan);
          const index = this.plans.findIndex(p => p._id === this.editingPlan!._id);
          if (index !== -1) {
            this.plans[index] = updatedPlan;
          }
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating plan:', error);
          alert('Error updating plan. Please try again.');
        }
      });
    } else {
    
      this.adminPlanService.createPlan(this.newPlan).subscribe({
        next: (newPlan) => {
          console.log('Plan created:', newPlan);
          this.plans.push(newPlan);
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating plan:', error);
          alert('Error creating plan. Please try again.');
        }
      });
    }
  }

  togglePlanStatus(plan: SubscriptionPlan): void {
    // const updatedStatus = !plan.isActive;
    
    // this.adminPlanService.updatePlanStatus(plan._id, updatedStatus).subscribe({
    //   next: (updatedPlan) => {
    //     console.log('Plan status updated:', updatedPlan);
    //     plan.isActive = updatedStatus;
    //     plan.updatedAt = new Date();
    //   },
    //   error: (error) => {
    //     console.error('Error updating plan status:', error);
    //     alert('Error updating plan status. Please try again.');
    //   }
    // });
  }

  deletePlan(planId: string): void {
    // if (confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
    //   this.adminPlanService.deletePlan(planId).subscribe({
    //     next: () => {
    //       console.log('Plan deleted successfully');
    //       this.plans = this.plans.filter(p => p._id !== planId);
    //     },
    //     error: (error) => {
    //       console.error('Error deleting plan:', error);
    //       alert('Error deleting plan. Please try again.');
    //     }
    //   });
    // }
  }

  addFeature(): void {
    if (!this.newPlan.features) {
      this.newPlan.features = [];
    }
    this.newPlan.features.push('');
  }

  removeFeature(index: number): void {
    if (this.newPlan.features) {
      this.newPlan.features.splice(index, 1);
    }
  }

  trackByPlanId(index: number, plan: SubscriptionPlan): string {
    return plan._id;
  }

  // Helper method to get role display name
  getRoleDisplayName(role: 'user' | 'trainer'): string {
    return role === 'user' ? 'User' : 'Trainer';
  }

  // Helper method to get role CSS class
  getRoleClass(role: 'user' | 'trainer'): string {
    return role === 'user' ? 'user' : 'trainer';
  }
}