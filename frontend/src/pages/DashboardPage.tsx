import { useEffect, useState, useCallback } from 'react';
import { dashboardService } from '../services/dashboard.service';
import { DashboardStats } from '../types/api';
import { CurrencyConverter } from '../components/CurrencyConverter';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  Calendar,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Target
} from 'lucide-react';

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
        <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow-sm border border-gray-200">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-10 pb-12">
        {/* Header Section - Centered */}
        <div className="text-center pt-8 pb-4">
          <h1 className="text-4xl font-black text-gray-900 mb-3">Financial Overview</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Track your income, expenses, and savings in one beautiful dashboard
          </p>
        </div>

        {/* Date Range Filter - Centered */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-lg border border-gray-200">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <span className="text-gray-400 text-sm font-semibold">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Income Card */}
          <div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 hover:border-emerald-200 transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Total Income</span>
              <p className="text-4xl font-black text-gray-900 mb-2">{formatCurrency(stats.totalIncome)}</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-sm text-emerald-600 font-semibold">This period</p>
              </div>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 hover:border-red-200 transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-3xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
                <TrendingDown className="h-10 w-10 text-white" />
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Total Expenses</span>
              <p className="text-4xl font-black text-gray-900 mb-2">{formatCurrency(stats.totalExpenses)}</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                <p className="text-sm text-red-600 font-semibold">This period</p>
              </div>
            </div>
          </div>

          {/* Net Savings Card */}
          <div className={`group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 ${stats.netSavings >= 0 ? 'hover:border-teal-200' : 'hover:border-orange-200'} transition-all duration-300`}>
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform ${stats.netSavings >= 0 ? 'bg-gradient-to-br from-teal-400 to-teal-600' : 'bg-gradient-to-br from-orange-400 to-orange-600'}`}>
                <PiggyBank className="h-10 w-10 text-white" />
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Net Savings</span>
              <p className={`text-4xl font-black mb-2 ${stats.netSavings >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
                {formatCurrency(stats.netSavings)}
              </p>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full animate-pulse ${stats.netSavings >= 0 ? 'bg-teal-500' : 'bg-orange-500'}`}></div>
                <p className={`text-sm font-semibold ${stats.netSavings >= 0 ? 'text-teal-600' : 'text-orange-600'}`}>
                  {stats.netSavings >= 0 ? 'Saved' : 'Overspent'}
                </p>
              </div>
            </div>
          </div>

          {/* Total Balance Card */}
          <div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 hover:border-blue-200 transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
                <Wallet className="h-10 w-10 text-white" />
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Total Balance</span>
              <p className="text-4xl font-black text-gray-900 mb-2">{formatCurrency(stats.totalBalance)}</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                <p className="text-sm text-gray-600 font-semibold">{stats.activeAccountsCount} accounts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="px-7 py-6 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center gap-4">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white">Monthly Trends</h3>
              <p className="text-sm text-blue-100 mt-1">Last 6 months performance</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Month</th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Income</th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Expenses</th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.monthlyTrends.map((trend) => (
                  <tr key={trend.month} className="hover:bg-blue-50 transition-colors">
                    <td className="px-8 py-5 text-sm font-semibold text-gray-900">{trend.month}</td>
                    <td className="px-8 py-5 text-sm text-right text-emerald-600 font-semibold">{formatCurrency(trend.income)}</td>
                    <td className="px-8 py-5 text-sm text-right text-red-600 font-semibold">{formatCurrency(trend.expenses)}</td>
                    <td className={`px-8 py-5 text-sm text-right font-bold ${trend.income - trend.expenses >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
                      {formatCurrency(trend.income - trend.expenses)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section: Top Spending & Currency Converter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Top Spending Categories */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="px-7 py-6 bg-gradient-to-r from-red-500 to-red-600 flex items-center gap-4">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white">Top Spending Categories</h3>
              <p className="text-sm text-red-100 mt-1">Where your money goes</p>
            </div>
          </div>
          <div className="p-8">
            {stats.topSpendingCategories.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-5 shadow-inner">
                  <PiggyBank className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-base font-semibold text-gray-600 mb-2">No spending data available</p>
                <p className="text-sm text-gray-400">Start adding expenses to see insights</p>
              </div>
            ) : (
              <div className="space-y-7">
                {stats.topSpendingCategories.map((category, idx) => (
                  <div key={category.categoryId}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                          {idx + 1}
                        </span>
                        <span className="text-base font-bold text-gray-800">{category.categoryName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-gray-900">{formatCurrency(category.totalAmount)}</span>
                        <span className="text-sm text-gray-500 ml-3 font-semibold">{category.percentageOfTotal.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 shadow-sm"
                        style={{ width: `${category.percentageOfTotal}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Currency Converter */}
        <div className="lg:col-span-1">
          <CurrencyConverter />
        </div>
      </div>

      {/* Budget Status */}
      {stats.budgetStatuses && stats.budgetStatuses.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="px-7 py-6 bg-gradient-to-r from-purple-500 to-purple-600 flex items-center gap-4">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white">Budget Status</h3>
              <p className="text-sm text-purple-100 mt-1">Track your spending limits</p>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.budgetStatuses.map((budget) => (
                <div 
                  key={budget.budgetId} 
                  className="rounded-xl p-5 border border-gray-200 bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{budget.budgetName}</h4>
                      {budget.categoryName && (
                        <p className="text-xs text-gray-500 mt-0.5">{budget.categoryName}</p>
                      )}
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                      budget.status === 'exceeded' 
                        ? 'bg-red-100 text-red-700' 
                        : budget.status === 'warning' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {budget.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span className="font-medium">{formatCurrency(budget.spentAmount)}</span>
                      <span>of {formatCurrency(budget.budgetAmount)}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          budget.status === 'exceeded' 
                            ? 'bg-red-500' 
                            : budget.status === 'warning' 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-right font-medium">{budget.percentageUsed.toFixed(0)}% used</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
