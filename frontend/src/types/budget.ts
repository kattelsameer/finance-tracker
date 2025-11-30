export type PeriodType = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface Budget {
  id: number;
  budgetName: string;
  amount: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  category?: {
    id: number;
    categoryName: string;
    categoryType: string;
  };
  periodType: PeriodType;
  startDate: string;
  endDate?: string;
  alertThreshold: number;
  alertEnabled: boolean;
  isActive: boolean;
  isOverBudget: boolean;
  isNearThreshold: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetRequest {
  budgetName: string;
  amount: number;
  categoryId?: number;
  periodType: PeriodType;
  startDate: string;
  endDate?: string;
  alertThreshold?: number;
  alertEnabled?: boolean;
}

export interface UpdateBudgetRequest {
  budgetName?: string;
  amount?: number;
  categoryId?: number;
  periodType?: PeriodType;
  startDate?: string;
  endDate?: string;
  alertThreshold?: number;
  alertEnabled?: boolean;
}

export interface BudgetSummary {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  overBudgetCount: number;
  nearLimitCount: number;
}
