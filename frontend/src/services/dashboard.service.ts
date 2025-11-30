import { apiClient } from '../lib/api-client';
import type { DashboardStats } from '../types';

export const dashboardService = {
  async getDashboardStats(startDate?: string, endDate?: string): Promise<DashboardStats> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const query = queryString ? `?${queryString}` : '';
    const url = `/dashboard/stats${query}`;
    
    return apiClient.get<DashboardStats>(url);
  }
};
