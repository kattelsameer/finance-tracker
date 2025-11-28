import { apiClient } from '../lib/api-client';
import type { TransactionReport } from '../types/api';

export const reportService = {
  async getTransactionReport(
    startDate: string,
    endDate: string,
    accountId?: number,
    categoryId?: number
  ): Promise<TransactionReport> {
    const params = new URLSearchParams({
      startDate,
      endDate
    });
    
    if (accountId) params.append('accountId', accountId.toString());
    if (categoryId) params.append('categoryId', categoryId.toString());
    
    return apiClient.get<TransactionReport>(`/api/v1/reports/transactions?${params.toString()}`);
  },

  async exportToCSV(startDate: string, endDate: string): Promise<Blob> {
    const params = new URLSearchParams({ startDate, endDate });
    return apiClient.get<Blob>(`/api/v1/reports/transactions/export?${params.toString()}`, {
      responseType: 'blob'
    });
  },

  downloadCSV(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
