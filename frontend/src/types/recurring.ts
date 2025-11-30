import type { TransactionType } from './transaction';

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
  description: string;
  frequency: {
    frequencyType: Frequency;
  };
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
  description: string;
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
  isActive?: boolean;
  transferToAccountId?: number;
  autoPost?: boolean;
}
