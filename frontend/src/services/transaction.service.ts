import { apiClient } from '../lib/api-client';
import { ENDPOINTS } from '../config/api';
import type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionFilter,
  PageResponse,
} from '../types';

export const transactionService = {
  async getAll(filter?: TransactionFilter): Promise<PageResponse<Transaction>> {
    return apiClient.get<PageResponse<Transaction>>(ENDPOINTS.TRANSACTIONS, {
      params: filter,
    });
  },

  async getById(id: number): Promise<Transaction> {
    return apiClient.get<Transaction>(`${ENDPOINTS.TRANSACTIONS}/${id}`);
  },

  async create(data: CreateTransactionRequest): Promise<Transaction> {
    return apiClient.post<Transaction>(ENDPOINTS.TRANSACTIONS, data);
  },

  async update(id: number, data: UpdateTransactionRequest): Promise<Transaction> {
    return apiClient.put<Transaction>(`${ENDPOINTS.TRANSACTIONS}/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${ENDPOINTS.TRANSACTIONS}/${id}`);
  },
};
