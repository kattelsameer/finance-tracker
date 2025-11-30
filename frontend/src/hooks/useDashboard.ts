import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export function useDashboardStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['dashboard', 'stats', startDate, endDate],
    queryFn: () => dashboardService.getDashboardStats(startDate, endDate),
  });
}
