import apiClient from '../lib/api-client';
import {
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
    const response = await apiClient.post<TransactionSearchResponse>(
      '/api/search/transactions',
      searchRequest
    );
    return response.data;
  },

  /**
   * Get all saved searches for the current user
   */
  async getAllSavedSearches(): Promise<SavedSearch[]> {
    const response = await apiClient.get<SavedSearch[]>('/api/search/saved');
    return response.data;
  },

  /**
   * Get a specific saved search
   */
  async getSavedSearch(id: number): Promise<SavedSearch> {
    const response = await apiClient.get<SavedSearch>(`/api/search/saved/${id}`);
    return response.data;
  },

  /**
   * Create a new saved search
   */
  async createSavedSearch(
    request: CreateSavedSearchRequest
  ): Promise<SavedSearch> {
    const response = await apiClient.post<SavedSearch>(
      '/api/search/saved',
      request
    );
    return response.data;
  },

  /**
   * Update an existing saved search
   */
  async updateSavedSearch(
    id: number,
    request: CreateSavedSearchRequest
  ): Promise<SavedSearch> {
    const response = await apiClient.put<SavedSearch>(
      `/api/search/saved/${id}`,
      request
    );
    return response.data;
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
    const response = await apiClient.patch<SavedSearch>(
      `/api/search/saved/${id}/set-default`
    );
    return response.data;
  },
};
