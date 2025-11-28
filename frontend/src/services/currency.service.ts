import { apiClient } from '../lib/api-client';
import type { Currency, ConvertAmountRequest, ConvertAmountResponse } from '../types/api';

export const currencyService = {
  async getAll(): Promise<Currency[]> {
    return apiClient.get<Currency[]>('/api/v1/currencies');
  },

  async getByCode(code: string): Promise<Currency> {
    return apiClient.get<Currency>(`/api/v1/currencies/${code}`);
  },

  async convert(request: ConvertAmountRequest): Promise<ConvertAmountResponse> {
    return apiClient.post<ConvertAmountResponse>('/api/v1/currencies/convert', request);
  },

  async refreshRates(): Promise<void> {
    await apiClient.post('/api/v1/currencies/refresh-rates');
  }
};
