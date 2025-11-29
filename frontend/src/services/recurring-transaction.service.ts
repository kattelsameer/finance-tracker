import { apiClient } from '../lib/api-client';
import type {
  RecurringTransaction,
  CreateRecurringTransactionRequest,
  UpdateRecurringTransactionRequest
} from '../types/api';

export const recurringTransactionService = {
  async getAll(activeOnly = false): Promise<RecurringTransaction[]> {
    const params = activeOnly ? '?activeOnly=true' : '';
    return apiClient.get<RecurringTransaction[]>(`/recurring-transactions${params}`);
  },

  async getById(id: number): Promise<RecurringTransaction> {
    return apiClient.get<RecurringTransaction>(`/recurring-transactions/${id}`);
  },

  async create(request: CreateRecurringTransactionRequest): Promise<RecurringTransaction> {
    return apiClient.post<RecurringTransaction>('/recurring-transactions', request);
  },

  async update(id: number, request: UpdateRecurringTransactionRequest): Promise<RecurringTransaction> {
    return apiClient.put<RecurringTransaction>(`/recurring-transactions/${id}`, request);
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/recurring-transactions/${id}`);
  },

  async processDue(): Promise<void> {
    await apiClient.post('/recurring-transactions/process-due');
  }
};
