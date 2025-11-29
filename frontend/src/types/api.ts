export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  defaultCurrency: string;
  timezone: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  email?: string;
  defaultCurrency?: string;
  timezone?: string;
}

export interface AuthResponse {
  userId: number;
  username: string;
  email: string;
  displayName: string;
  message: string;
  expiresAt?: string;
}

export interface ErrorResponse {
  code: number;
  error: string;
  message: string;
  details?: string;
  fieldErrors?: FieldError[];
  path: string;
  timestamp: string;
}

export interface FieldError {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

export interface AccountType {
  id: number;
  typeCode: string;
  typeName: string;
  isLiability: boolean;
  displayOrder: number;
}

export interface Account {
  id: number;
  accountType: AccountType;
  accountName: string;
  currency: string;
  initialBalance: number;
  currentBalance: number;
  institutionName?: string;
  accountNumberMasked?: string;
  colorCode: string;
  icon: string;
  isActive: boolean;
  includeInNetWorth: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountRequest {
  accountTypeId: number;
  accountName: string;
  currency?: string;
  initialBalance?: number;
  institutionName?: string;
  accountNumberMasked?: string;
  colorCode?: string;
  icon?: string;
  includeInNetWorth?: boolean;
  notes?: string;
}

export interface UpdateAccountRequest {
  accountTypeId?: number;
  accountName?: string;
  currency?: string;
  institutionName?: string;
  accountNumberMasked?: string;
  colorCode?: string;
  icon?: string;
  isActive?: boolean;
  includeInNetWorth?: boolean;
  notes?: string;
}

export interface Category {
  id: number;
  parentId?: number;
  categoryName: string;
  categoryType: 'INCOME' | 'EXPENSE';
  colorCode: string;
  icon: string;
  isSystem: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  children?: Category[];
}

export interface CreateCategoryRequest {
  parentId?: number;
  categoryName: string;
  categoryType: 'INCOME' | 'EXPENSE';
  colorCode?: string;
  icon?: string;
  displayOrder?: number;
}

export interface UpdateCategoryRequest {
  parentId?: number;
  categoryName?: string;
  colorCode?: string;
  icon?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Transaction {
  id: number;
  accountId: number;
  accountName: string;
  categoryId?: number;
  categoryName?: string;
  transactionType: TransactionType;
  amount: number;
  currency: string;
  transactionDate: string;
  description?: string;
  notes?: string;
  referenceNumber?: string;
  isRecurring: boolean;
  recurringTransactionId?: number;
  transferToAccountId?: number;
  transferToAccountName?: string;
  transferTransactionId?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  accountId: number;
  categoryId?: number;
  transactionType: TransactionType;
  amount: number;
  currency?: string;
  transactionDate: string;
  description?: string;
  notes?: string;
  referenceNumber?: string;
  transferToAccountId?: number;
  tagIds?: number[];
}

export interface UpdateTransactionRequest {
  accountId?: number;
  categoryId?: number;
  transactionType?: TransactionType;
  amount?: number;
  transactionDate?: string;
  description?: string;
  notes?: string;
  referenceNumber?: string;
  transferToAccountId?: number;
  tagIds?: number[];
}

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  accountId?: number;
  categoryId?: number;
  transactionType?: TransactionType;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  tagIds?: number[];
  page?: number;
  size?: number;
  sort?: string;
}

export interface Tag {
  id: number;
  tagName: string;
  colorCode: string;
  createdAt: string;
}

export interface CreateTagRequest {
  tagName: string;
  colorCode?: string;
}

export interface UpdateTagRequest {
  tagName?: string;
  colorCode?: string;
}

export type PeriodType = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface Budget {
  id: number;
  categoryId?: number;
  categoryName?: string;
  budgetName: string;
  amount: number;
  periodType: PeriodType;
  startDate: string;
  endDate?: string;
  alertThreshold: number;
  alertEnabled: boolean;
  isActive: boolean;
  spent: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetRequest {
  categoryId?: number;
  budgetName: string;
  amount: number;
  periodType: PeriodType;
  startDate: string;
  endDate?: string;
  alertThreshold?: number;
  alertEnabled?: boolean;
}

export interface UpdateBudgetRequest {
  categoryId?: number;
  budgetName?: string;
  amount?: number;
  periodType?: PeriodType;
  startDate?: string;
  endDate?: string;
  alertThreshold?: number;
  alertEnabled?: boolean;
  isActive?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Dashboard & Reporting Types

export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  categoryType: 'INCOME' | 'EXPENSE';
  totalAmount: number;
  transactionCount: number;
  percentageOfTotal: number;
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
  categoryType: 'INCOME' | 'EXPENSE';
  totalAmount: number;
  transactionCount: number;
  percentageOfTotal: number;
}

export interface AccountBreakdown {
  accountId: number;
  accountName: string;
  income: number;
  expenses: number;
  netChange: number;
  transactionCount: number;
}

export interface DailyBreakdown {
  date: string;
  income: number;
  expenses: number;
  netChange: number;
  transactionCount: number;
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

// Recurring Transactions

export type Frequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface RecurringTransaction {
  id: number;
  accountId: number;
  accountName: string;
  categoryId?: number;
  categoryName?: string;
  transactionType: TransactionType;
  amount: number;
  currency: string;
  description?: string;
  frequency: Frequency;
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
  transferToAccountId?: number;
  transferToAccountName?: string;
  isActive: boolean;
  autoPost: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringTransactionRequest {
  accountId: number;
  categoryId?: number;
  transactionType: TransactionType;
  amount: number;
  currency?: string;
  description?: string;
  frequency: Frequency;
  startDate: string;
  endDate?: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
  transferToAccountId?: number;
  autoPost?: boolean;
}

export interface UpdateRecurringTransactionRequest {
  accountId?: number;
  categoryId?: number;
  transactionType?: TransactionType;
  amount?: number;
  currency?: string;
  description?: string;
  frequency?: Frequency;
  startDate?: string;
  endDate?: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
  transferToAccountId?: number;
  isActive?: boolean;
  autoPost?: boolean;
}

// Currency

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  lastUpdated: string;
}

export interface ConvertAmountRequest {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}

export interface ConvertAmountResponse {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
}

// Advanced Search

export interface TransactionSearchRequest {
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  accountId?: number;
  categoryId?: number;
  transactionType?: TransactionType;
  minAmount?: number;
  maxAmount?: number;
  tagIds?: number[];
  isRecurring?: boolean;
  currency?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface TransactionSearchResponse {
  content: Transaction[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface SavedSearch {
  id: number;
  searchName: string;
  searchCriteria: string; // JSON string
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavedSearchRequest {
  searchName: string;
  searchCriteria: string; // JSON string
  isDefault?: boolean;
}

// Notifications

export type NotificationType =
  | 'BUDGET_ALERT'
  | 'BUDGET_EXCEEDED'
  | 'RECURRING_TRANSACTION_DUE'
  | 'LOW_BALANCE_WARNING'
  | 'LARGE_TRANSACTION'
  | 'UNUSUAL_SPENDING'
  | 'MONTHLY_SUMMARY'
  | 'ACCOUNT_INACTIVE'
  | 'CURRENCY_RATE_CHANGE';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Notification {
  id: number;
  notificationType: NotificationType;
  title: string;
  message?: string;
  priority: NotificationPriority;
  isRead: boolean;
  isSent: boolean;
  relatedEntityType?: string;
  relatedEntityId?: number;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
  sentAt?: string;
}

export interface NotificationPreference {
  id: number;
  budgetAlertsEnabled: boolean;
  lowBalanceAlertsEnabled: boolean;
  recurringRemindersEnabled: boolean;
  largeTransactionAlertsEnabled: boolean;
  unusualSpendingAlertsEnabled: boolean;
  monthlySummaryEnabled: boolean;
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  lowBalanceThreshold: number;
  largeTransactionThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationPreferenceRequest {
  budgetAlertsEnabled?: boolean;
  lowBalanceAlertsEnabled?: boolean;
  recurringRemindersEnabled?: boolean;
  largeTransactionAlertsEnabled?: boolean;
  unusualSpendingAlertsEnabled?: boolean;
  monthlySummaryEnabled?: boolean;
  emailNotificationsEnabled?: boolean;
  inAppNotificationsEnabled?: boolean;
  lowBalanceThreshold?: number;
  largeTransactionThreshold?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
