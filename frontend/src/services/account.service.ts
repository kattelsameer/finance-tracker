import { apiClient } from '../lib/api-client';
import { ENDPOINTS } from '../config/api';
import type {
  Account,
  AccountType,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../types';

export const accountService = {
  async getAll(): Promise<Account[]> {
    return apiClient.get<Account[]>(ENDPOINTS.ACCOUNTS);
  },

  async getById(id: number): Promise<Account> {
    return apiClient.get<Account>(`${ENDPOINTS.ACCOUNTS}/${id}`);
  },

  async create(data: CreateAccountRequest): Promise<Account> {
    return apiClient.post<Account>(ENDPOINTS.ACCOUNTS, data);
  },

  async update(id: number, data: UpdateAccountRequest): Promise<Account> {
    return apiClient.put<Account>(`${ENDPOINTS.ACCOUNTS}/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${ENDPOINTS.ACCOUNTS}/${id}`);
  },

  async getAccountTypes(): Promise<AccountType[]> {
    return apiClient.get<AccountType[]>(ENDPOINTS.ACCOUNT_TYPES);
  },
};
