import { useEffect, useState, useCallback } from 'react';
import { dashboardService } from '../services/dashboard.service';
import { DashboardStats } from '../types';
import { CurrencyConverter } from '../components/CurrencyConverter';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, RefreshCw } from 'lucide-react';
import {
  SummaryCards,
  MonthlyTrendsChart,
  TopSpendingCategories,
  BudgetStatusList,
  DateRangeFilter
} from '../components/dashboard';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardStats(dateRange.startDate, dateRange.endDate);
      setStats(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const formatCurrency = (amount: number) => {
    const currency = user?.defaultCurrency || 'NPR';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
        <p className="mt-4 text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="bg-white rounded-lg p-8 text-center max-w-md border border-gray-200">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Overview</h1>
        <p className="text-gray-600">Track your income, expenses, and savings</p>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onStartDateChange={(date) => setDateRange({ ...dateRange, startDate: date })}
        onEndDateChange={(date) => setDateRange({ ...dateRange, endDate: date })}
      />

      {/* Summary Cards */}
      <SummaryCards stats={stats} formatCurrency={formatCurrency} />

      {/* Monthly Trends */}
      <MonthlyTrendsChart trends={stats.monthlyTrends} formatCurrency={formatCurrency} />

      {/* Bottom Section: Top Spending & Currency Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Spending Categories */}
        <div className="lg:col-span-2">
          <TopSpendingCategories 
            categories={stats.topSpendingCategories} 
            formatCurrency={formatCurrency} 
          />
        </div>

        {/* Currency Converter */}
        <div className="lg:col-span-1">
          <CurrencyConverter />
        </div>
      </div>

      {/* Budget Status */}
      <BudgetStatusList budgets={stats.budgetStatuses} formatCurrency={formatCurrency} />
    </div>
  );
}
