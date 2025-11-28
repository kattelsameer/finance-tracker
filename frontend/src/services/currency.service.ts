import { apiClient } from '../lib/api-client';
import type { Currency, ConvertAmountRequest, ConvertAmountResponse } from '../types/api';

export const currencyService = {
  async getAll(): Promise<Currency[]> {
    const response = await apiClient.get('/api/v1/currencies');
    return response.data;
  },

  async getByCode(code: string): Promise<Currency> {
    const response = await apiClient.get(`/api/v1/currencies/${code}`);
    return response.data;
  },

  async convert(request: ConvertAmountRequest): Promise<ConvertAmountResponse> {
    const response = await apiClient.post('/api/v1/currencies/convert', request);
    return response.data;
  },

  async refreshRates(): Promise<void> {
    await apiClient.post('/api/v1/currencies/refresh-rates');
  }
};
