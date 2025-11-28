import { apiClient } from '../lib/api-client';
import type {
  RecurringTransaction,
  CreateRecurringTransactionRequest,
  UpdateRecurringTransactionRequest
} from '../types/api';

export const recurringTransactionService = {
  async getAll(activeOnly = false): Promise<RecurringTransaction[]> {
    const params = activeOnly ? '?activeOnly=true' : '';
    const response = await apiClient.get(`/api/v1/recurring-transactions${params}`);
    return response.data;
  },

  async getById(id: number): Promise<RecurringTransaction> {
    const response = await apiClient.get(`/api/v1/recurring-transactions/${id}`);
    return response.data;
  },

  async create(request: CreateRecurringTransactionRequest): Promise<RecurringTransaction> {
    const response = await apiClient.post('/api/v1/recurring-transactions', request);
    return response.data;
  },

  async update(id: number, request: UpdateRecurringTransactionRequest): Promise<RecurringTransaction> {
    const response = await apiClient.put(`/api/v1/recurring-transactions/${id}`, request);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/recurring-transactions/${id}`);
  },

  async processDue(): Promise<void> {
    await apiClient.post('/api/v1/recurring-transactions/process-due');
  }
};
