import { apiClient } from '../lib/api-client';
import type {
  TransactionSearchRequest,
  TransactionSearchResponse,
  SavedSearch,
  CreateSavedSearchRequest,
} from '../types/api';

export const searchService = {
  /**
   * Advanced search for transactions
   */
  async advancedSearch(
    searchRequest: TransactionSearchRequest
  ): Promise<TransactionSearchResponse> {
    return apiClient.post<TransactionSearchResponse>(
      '/api/search/transactions',
      searchRequest
    );
  },

  /**
   * Get all saved searches for the current user
   */
  async getAllSavedSearches(): Promise<SavedSearch[]> {
    return apiClient.get<SavedSearch[]>('/api/search/saved');
  },

  /**
   * Get a specific saved search
   */
  async getSavedSearch(id: number): Promise<SavedSearch> {
    return apiClient.get<SavedSearch>(`/api/search/saved/${id}`);
  },

  /**
   * Create a new saved search
   */
  async createSavedSearch(
    request: CreateSavedSearchRequest
  ): Promise<SavedSearch> {
    return apiClient.post<SavedSearch>(
      '/api/search/saved',
      request
    );
  },

  /**
   * Update an existing saved search
   */
  async updateSavedSearch(
    id: number,
    request: CreateSavedSearchRequest
  ): Promise<SavedSearch> {
    return apiClient.put<SavedSearch>(
      `/api/search/saved/${id}`,
      request
    );
  },

  /**
   * Delete a saved search
   */
  async deleteSavedSearch(id: number): Promise<void> {
    await apiClient.delete(`/api/search/saved/${id}`);
  },

  /**
   * Set a saved search as default
   */
  async setDefaultSearch(id: number): Promise<SavedSearch> {
    return apiClient.patch<SavedSearch>(
      `/api/search/saved/${id}/set-default`
    );
  },
};
