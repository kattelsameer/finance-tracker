import { apiClient } from '../lib/api-client';
import { ENDPOINTS } from '../config/api';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/api';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    return apiClient.get<Category[]>(ENDPOINTS.CATEGORIES);
  },

  async getById(id: number): Promise<Category> {
    return apiClient.get<Category>(`${ENDPOINTS.CATEGORIES}/${id}`);
  },

  async create(data: CreateCategoryRequest): Promise<Category> {
    return apiClient.post<Category>(ENDPOINTS.CATEGORIES, data);
  },

  async update(id: number, data: UpdateCategoryRequest): Promise<Category> {
    return apiClient.put<Category>(`${ENDPOINTS.CATEGORIES}/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${ENDPOINTS.CATEGORIES}/${id}`);
  },

  async getByType(type: 'INCOME' | 'EXPENSE'): Promise<Category[]> {
    return apiClient.get<Category[]>(`${ENDPOINTS.CATEGORIES}/type/${type}`);
  },
};
