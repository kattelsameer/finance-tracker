import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboard.service';
import { DashboardStats } from '../types/api';
import { CurrencyConverter } from '../components/CurrencyConverter';
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDashboardStats();
  }, [dateRange]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardStats(dateRange.startDate, dateRange.endDate);
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
    <div className="space-y-8">
      {/* Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Financial Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Track your income, expenses, and savings</p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200">
          <Calendar className="h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Income Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Total Income</span>
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalIncome)}</p>
          <p className="text-xs text-emerald-600 mt-2 font-medium">+Income this period</p>
        </div>

        {/* Expenses Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Total Expenses</span>
            <div className="p-2.5 bg-red-50 rounded-xl">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalExpenses)}</p>
          <p className="text-xs text-red-600 mt-2 font-medium">-Spent this period</p>
        </div>

        {/* Net Savings Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Net Savings</span>
            <div className={`p-2.5 rounded-xl ${stats.netSavings >= 0 ? 'bg-teal-50' : 'bg-orange-50'}`}>
              <PiggyBank className={`h-5 w-5 ${stats.netSavings >= 0 ? 'text-teal-600' : 'text-orange-600'}`} />
            </div>
          </div>
          <p className={`text-2xl font-semibold ${stats.netSavings >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
            {formatCurrency(stats.netSavings)}
          </p>
          <p className="text-xs text-gray-500 mt-2 font-medium">{stats.netSavings >= 0 ? 'Saved' : 'Overspent'}</p>
        </div>

        {/* Total Balance Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Total Balance</span>
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalBalance)}</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">{stats.activeAccountsCount} active accounts</p>
        </div>
      </div>

      {/* Monthly Trends & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Monthly Trends</h3>
            <span className="text-xs text-gray-400 ml-auto">Last 6 months</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Income</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Expenses</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.monthlyTrends.map((trend) => (
                  <tr key={trend.month} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{trend.month}</td>
                    <td className="px-6 py-4 text-sm text-right text-emerald-600 font-medium">{formatCurrency(trend.income)}</td>
                    <td className="px-6 py-4 text-sm text-right text-red-600 font-medium">{formatCurrency(trend.expenses)}</td>
                    <td className={`px-6 py-4 text-sm text-right font-semibold ${trend.income - trend.expenses >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
                      {formatCurrency(trend.income - trend.expenses)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Spending Categories */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900">Top Spending</h3>
          </div>
          <div className="p-6 space-y-5">
            {stats.topSpendingCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <PiggyBank className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No spending data</p>
              </div>
            ) : (
              stats.topSpendingCategories.map((category, idx) => (
                <div key={category.categoryId}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{category.categoryName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(category.totalAmount)}</span>
                      <span className="text-xs text-gray-400 ml-2">{category.percentageOfTotal.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${category.percentageOfTotal}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Budget Status */}
      {stats.budgetStatuses && stats.budgetStatuses.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Budget Status</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

      {/* Currency Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CurrencyConverter />
        </div>
      </div>
    </div>
  );
}
