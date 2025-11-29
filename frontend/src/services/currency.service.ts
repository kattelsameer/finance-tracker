import { apiClient } from '../lib/api-client';
import type { Currency, ConvertAmountRequest, ConvertAmountResponse } from '../types/api';

export const currencyService = {
  async getAll(): Promise<Currency[]> {
    return apiClient.get<Currency[]>('/currencies');
  },

  async getByCode(code: string): Promise<Currency> {
    return apiClient.get<Currency>(`/currencies/${code}`);
  },

  async convert(request: ConvertAmountRequest): Promise<ConvertAmountResponse> {
    return apiClient.post<ConvertAmountResponse>('/currencies/convert', request);
  },

  async refreshRates(): Promise<void> {
    await apiClient.post('/currencies/refresh-rates');
  }
};
