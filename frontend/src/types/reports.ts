export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}

export interface BudgetStatus {
  budgetId: number;
  budgetName: string;
  categoryName?: string;
  budgetAmount: number;
  spentAmount: number;
  percentageUsed: number;
  status: 'ok' | 'warning' | 'exceeded';
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  totalBalance: number;
  activeAccountsCount: number;
  topSpendingCategories: CategorySpending[];
  monthlyTrends: MonthlyTrend[];
  budgetStatuses: BudgetStatus[];
}

export interface CategoryBreakdown {
  categoryId: number;
  categoryName: string;
  transactionType: 'INCOME' | 'EXPENSE';
  amount: number;
  count: number;
  percentage: number;
}

export interface AccountBreakdown {
  accountId: number;
  accountName: string;
  income: number;
  expenses: number;
  netAmount: number;
  transactionCount: number;
}

export interface DailyBreakdown {
  date: string;
  income: number;
  expenses: number;
  netAmount: number;
}

export interface TransactionReport {
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  categoryBreakdown: CategoryBreakdown[];
  accountBreakdown: AccountBreakdown[];
  dailyBreakdown: DailyBreakdown[];
}
