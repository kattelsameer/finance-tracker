import { apiClient } from '../lib/api-client';
import type { Currency, ConvertAmountRequest, ConvertAmountResponse } from '../types';

export const currencyService = {
  async getAll(): Promise<Currency[]> {
    return apiClient.get<Currency[]>('currencies');
  },

  async getByCode(code: string): Promise<Currency> {
    return apiClient.get<Currency>(`currencies/${code}`);
  },

  async convert(request: ConvertAmountRequest): Promise<ConvertAmountResponse> {
    return apiClient.post<ConvertAmountResponse>('currencies/convert', request);
  },

  async refreshRates(): Promise<void> {
    // FIX (ISSUE-5.1): The backend exposes POST /currencies/update-rates.
    // The previous call to /currencies/refresh-rates always returned 404.
    await apiClient.post('currencies/update-rates');
  }
};
