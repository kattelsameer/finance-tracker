import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboard.service';
import { DashboardStats } from '../types/api';

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
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{formatCurrency(stats.totalIncome)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Net Savings</h3>
          <p className={`mt-2 text-3xl font-bold ${stats.netSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(stats.netSavings)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Balance</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{formatCurrency(stats.totalBalance)}</p>
          <p className="mt-1 text-sm text-gray-500">{stats.activeAccountsCount} active accounts</p>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Trends (Last 6 Months)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Income</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expenses</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.monthlyTrends.map((trend) => (
                <tr key={trend.month}>
                  <td className="px-4 py-3 text-sm text-gray-900">{trend.month}</td>
                  <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(trend.income)}</td>
                  <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(trend.expenses)}</td>
                  <td className={`px-4 py-3 text-sm ${trend.income - trend.expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(trend.income - trend.expenses)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Spending Categories */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Spending Categories</h2>
        <div className="space-y-3">
          {stats.topSpendingCategories.map((category) => (
            <div key={category.categoryId} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{category.categoryName}</span>
                  <span className="text-sm text-gray-600">{formatCurrency(category.totalAmount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${category.percentageOfTotal}%` }}
                  ></div>
                </div>
              </div>
              <span className="ml-4 text-sm text-gray-500">{category.percentageOfTotal.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Statuses */}
      {stats.budgetStatuses && stats.budgetStatuses.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Budget Status</h2>
          <div className="space-y-4">
            {stats.budgetStatuses.map((budget) => (
              <div key={budget.budgetId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{budget.budgetName}</h3>
                    {budget.categoryName && <p className="text-sm text-gray-500">{budget.categoryName}</p>}
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    budget.status === 'exceeded' ? 'bg-red-100 text-red-800' :
                    budget.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {budget.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Spent: {formatCurrency(budget.spentAmount)}</span>
                  <span>Budget: {formatCurrency(budget.budgetAmount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      budget.status === 'exceeded' ? 'bg-red-600' :
                      budget.status === 'warning' ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{budget.percentageUsed.toFixed(1)}% used</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
