export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  isActive: boolean;
  features: string[];
  trialPeriod?: number;
  limits: {
    oneOnOneSessions: number | 'unlimited';
    aiQueries: number | 'unlimited';
    chatAccess: boolean;
    communityAccess: boolean;
    prioritySupport: boolean;
    videoAccess: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanLimits {
  oneOnOneSessions: number | 'unlimited';
  aiQueries: number | 'unlimited';
  chatAccess: boolean;
  videoAccess: boolean;
  communityAccess: boolean;
  prioritySupport: boolean;
}

export interface PlanQuery {
  search?: string;
  isActive?: boolean;
  billingCycle?: 'monthly' | 'yearly';
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreatePlanRequest {
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  isActive?: boolean;
  features: string[];
  limits: PlanLimits;
  trialPeriod?: number;
  sortOrder?: number;
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {
  id?: string;
}
