import { apiClient } from '../lib/api-client';
import type { DashboardStats } from '../types/api';

export const dashboardService = {
  async getDashboardStats(startDate?: string, endDate?: string): Promise<DashboardStats> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const url = `/api/v1/dashboard/stats${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<DashboardStats>(url);
  }
};
