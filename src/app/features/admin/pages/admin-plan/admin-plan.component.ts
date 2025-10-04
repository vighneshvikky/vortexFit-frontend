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

interface ValidationErrors {
  name?: string;
  description?: string;
  price?: string;
  role?: string;
  features?: string;
  limits?: {
    oneOnOneSessions?: string;
    aiQueries?: string;
  };
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
  isSubmitting = false;

  newPlan: Partial<SubscriptionPlan> = {
    name: '',
    description: '',
    price: 0,
    billingCycle: 'monthly',
    role: 'user', // Default role

    limits: {
      oneOnOneSessions: 0,
      aiQueries: 0,
      chatAccess: false,
      videoAccess: false,
      communityAccess: false,
      prioritySupport: false,
    },
  };

  validationErrors: ValidationErrors = {};
  newFeature = '';

  constructor(private adminPlanService: PlanService) {
    console.log('AdminPlanComponent initialized');
  }

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.adminPlanService.getPlans().subscribe({
      next: (data) => {
        this.plans = data;
      },
      error: (error) => {
        console.error('Error loading plans:', error);
      },
    });
  }

  openAddPlanModal(): void {
    this.showAddPlanModal = true;
    this.editingPlan = null;
    this.resetNewPlan();
    this.clearValidationErrors();
  }

  openEditPlan(plan: SubscriptionPlan): void {
    this.editingPlan = plan;
    this.showAddPlanModal = true;
    this.newPlan = {
      ...plan,
      features: [...plan.features],
      limits: { ...plan.limits },
    };
  }

  clearValidationErrors(): void {
    this.validationErrors = {};
  }

  validatePlan(): boolean {
    this.clearValidationErrors();
    let isValid = true;

    if (!this.newPlan.name || this.newPlan.name.trim().length === 0) {
      this.validationErrors.name = 'Plan name is required';
      isValid = false;
    } else if (this.newPlan.name.trim().length < 2) {
      this.validationErrors.name =
        'Plan name must be at least 2 characters long';
      isValid = false;
    } else if (this.newPlan.name.trim().length > 50) {
      this.validationErrors.name = 'Plan name must be less than 50 characters';
      isValid = false;
    } else {
      const namePattern = /^[A-Z\s_]+$/;
      if (!namePattern.test(this.newPlan.name.trim())) {
        this.validationErrors.name =
          'Plan name must contain only capital letters and spaces';
        isValid = false;
      } else {
        const duplicateName = this.plans.find(
          (plan) =>
            plan.name.toLowerCase() ===
              this.newPlan.name!.trim().toLowerCase() &&
            (!this.editingPlan || plan._id !== this.editingPlan._id)
        );
        if (duplicateName) {
          this.validationErrors.name = 'A plan with this name already exists';
          isValid = false;
        }
      }
    }

    if (
      !this.newPlan.description ||
      this.newPlan.description.trim().length === 0
    ) {
      this.validationErrors.description = 'Description is required';
      isValid = false;
    } else if (this.newPlan.description.trim().length < 10) {
      this.validationErrors.description =
        'Description must be at least 10 characters long';
      isValid = false;
    } else if (this.newPlan.description.trim().length > 500) {
      this.validationErrors.description =
        'Description must be less than 500 characters';
      isValid = false;
    }

    if (this.newPlan.price === undefined || this.newPlan.price === null) {
      this.validationErrors.price = 'Price is required';
      isValid = false;
    } else if (this.newPlan.price < 0) {
      this.validationErrors.price = 'Price must be greater than 0';
      isValid = false;
    } else if (this.newPlan.price > 100000) {
      this.validationErrors.price =
        'Price must be less than or equal to ₹1,00,000';
      isValid = false;
    }

    if (!this.newPlan.role) {
      this.validationErrors.role = 'Role is required';
      isValid = false;
    } else if (!['user', 'trainer'].includes(this.newPlan.role)) {
      this.validationErrors.role = 'Invalid role selected';
      isValid = false;
    }

    if (!this.validationErrors.limits) {
      this.validationErrors.limits = {};
    }

    if (this.newPlan.limits) {
      if (typeof this.newPlan.limits.oneOnOneSessions === 'number') {
        if (this.newPlan.limits.oneOnOneSessions < 1) {
          this.validationErrors.limits.oneOnOneSessions =
            '1:1 Sessions must be between 1 and 100';
          isValid = false;
        } else if (this.newPlan.limits.oneOnOneSessions > 100) {
          this.validationErrors.limits.oneOnOneSessions =
            '1:1 Sessions must be between 1 and 100';
          isValid = false;
        }
      }

      if (typeof this.newPlan.limits.aiQueries === 'number') {
        if (this.newPlan.limits.aiQueries < 1) {
          this.validationErrors.limits.aiQueries =
            'AI Queries must be between 1 and 100';
          isValid = false;
        } else if (this.newPlan.limits.aiQueries > 100) {
          this.validationErrors.limits.aiQueries =
            'AI Queries must be between 1 and 100';
          isValid = false;
        }
      }
    }

    return isValid;
  }

  closeModal(): void {
    this.showAddPlanModal = false;
    this.editingPlan = null;
    this.resetNewPlan();
    this.isSubmitting = false;
  }

  resetNewPlan(): void {
    this.newPlan = {
      name: '',
      description: '',
      price: 0,
      billingCycle: 'monthly',
      role: 'user',
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
    if (this.isSubmitting) {
      return; // Prevent double submission
    }

    // Trim string values
    if (this.newPlan.name) {
      this.newPlan.name = this.newPlan.name.trim();
    }
    if (this.newPlan.description) {
      this.newPlan.description = this.newPlan.description.trim();
    }

    if (!this.validatePlan()) {
      console.log('Validation failed:', this.validationErrors);
      return;
    }

    this.isSubmitting = true;
    console.log('Saving plan:', this.newPlan);

    if (this.editingPlan) {
      this.adminPlanService
        .updatePlan(this.editingPlan._id, this.newPlan)
        .subscribe({
          next: (updatedPlan) => {
            console.log('Plan updated:', updatedPlan);
            const index = this.plans.findIndex(
              (p) => p._id === this.editingPlan!._id
            );
            if (index !== -1) {
              this.plans[index] = updatedPlan;
            }
            this.closeModal();
          },
        });
    } else {
      this.adminPlanService.createPlan(this.newPlan).subscribe({
        next: (newPlan) => {
          console.log('Plan created:', newPlan);
          this.plans.push(newPlan);
          this.closeModal();
        },
      });
    }
  }

  togglePlanStatus(plan: SubscriptionPlan): void {}

  deletePlan(planId: string): void {
    this.adminPlanService.deletPlan(planId).subscribe((res) => {
      if(res){
        this.plans = this.plans.filter((plan) => plan._id !== planId)
      }
    })
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

  getRoleDisplayName(role: 'user' | 'trainer'): string {
    return role === 'user' ? 'User' : 'Trainer';
  }

  getRoleClass(role: 'user' | 'trainer'): string {
    return role === 'user' ? 'user' : 'trainer';
  }

getErrorMessage(field: string): string {
  return field
    .split('.')
    .reduce((acc: any, key) => acc?.[key], this.validationErrors) || '';
}

hasError(field: string): boolean {
  return !!this.getErrorMessage(field);
}

}
