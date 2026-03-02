import { apiClient } from '../lib/api-client';
import { ENDPOINTS } from '../config/api';
import type { CurrencyChangeRequest, CurrencyChangeResponse } from '../types/currency';

export const settingsService = {
  /**
   * Change the user's default currency.
   * See CurrencyChangeRequest for action options (CONVERT | RESET).
   */
  async changeCurrency(request: CurrencyChangeRequest): Promise<CurrencyChangeResponse> {
    return apiClient.post<CurrencyChangeResponse>(
      ENDPOINTS.SETTINGS.CURRENCY_CHANGE,
      request
    );
  },
};
