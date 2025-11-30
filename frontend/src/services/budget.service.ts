import { apiClient } from '../lib/api-client';
import { ENDPOINTS } from '../config/api';
import type {
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from '../types';

export const budgetService = {
  async getAll(): Promise<Budget[]> {
    return apiClient.get<Budget[]>(ENDPOINTS.BUDGETS);
  },

  async getById(id: number): Promise<Budget> {
    return apiClient.get<Budget>(`${ENDPOINTS.BUDGETS}/${id}`);
  },

  async create(data: CreateBudgetRequest): Promise<Budget> {
    return apiClient.post<Budget>(ENDPOINTS.BUDGETS, data);
  },

  async update(id: number, data: UpdateBudgetRequest): Promise<Budget> {
    return apiClient.put<Budget>(`${ENDPOINTS.BUDGETS}/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${ENDPOINTS.BUDGETS}/${id}`);
  },

  async getActive(): Promise<Budget[]> {
    return apiClient.get<Budget[]>(`${ENDPOINTS.BUDGETS}/active`);
  },
};
