import { useEffect, useState, useCallback } from 'react';
import { reportService } from '../services/report.service';
import { useAuth } from '../contexts/AuthContext';
import type { TransactionReport } from '../types/api';
import {
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  FileDown,
  Calendar,
  PieChart,
  Wallet,
  BarChart3,
  CalendarDays,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export function ReportsPage() {
  const { user } = useAuth();
  const defaultCurrency = user?.defaultCurrency || 'NPR';
  
  const [report, setReport] = useState<TransactionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getTransactionReport(
        dateRange.startDate,
        dateRange.endDate
      );
      setReport(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportCSV = async () => {
    try {
      const blob = await reportService.exportToCSV(dateRange.startDate, dateRange.endDate);
      const filename = `transactions_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
      reportService.downloadCSV(blob, filename);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to export CSV');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: defaultCurrency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
        <p className="mt-4 text-gray-500 font-medium">Generating report...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">
      {/* Header with Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900">Transaction Reports</h2>
          <p className="text-sm text-gray-500 mt-1">Analyze your financial activity</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={!report}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex-shrink-0"
        >
          <FileDown className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          <button
            onClick={fetchReport}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 font-bold">×</button>
        </div>
      )}

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">Total Income</span>
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(report.totalIncome)}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">Total Expenses</span>
                <div className="p-2.5 bg-red-50 rounded-xl">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(report.totalExpenses)}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">Net Amount</span>
                <div className={`p-2.5 rounded-xl ${report.netAmount >= 0 ? 'bg-teal-50' : 'bg-orange-50'}`}>
                  <ArrowRightLeft className={`h-5 w-5 ${report.netAmount >= 0 ? 'text-teal-600' : 'text-orange-600'}`} />
                </div>
              </div>
              <p className={`text-2xl font-semibold ${report.netAmount >= 0 ? 'text-teal-600' : 'text-orange-600'}`}>
                {formatCurrency(report.netAmount)}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">Transactions</span>
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{report.transactionCount}</p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <PieChart className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Category Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Count</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">% Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.categoryBreakdown.map((cat) => (
                    <tr key={`${cat.categoryId}-${cat.categoryType}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.categoryName}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          cat.categoryType === 'INCOME' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {cat.categoryType === 'INCOME' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {cat.categoryType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">{formatCurrency(cat.totalAmount)}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">{cat.transactionCount}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-lg text-gray-600 font-medium">
                          {cat.percentageOfTotal.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Account Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Account Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Income</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Expenses</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Change</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.accountBreakdown.map((acc) => (
                    <tr key={acc.accountId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{acc.accountName}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className="text-emerald-600 font-medium">{formatCurrency(acc.income)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className="text-red-600 font-medium">{formatCurrency(acc.expenses)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className={`font-semibold ${acc.netChange >= 0 ? 'text-teal-600' : 'text-orange-600'}`}>
                          {formatCurrency(acc.netChange)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">{acc.transactionCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-lg">
                <CalendarDays className="h-5 w-5 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Daily Breakdown</h3>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Income</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Expenses</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Net</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.dailyBreakdown.map((day) => (
                    <tr key={day.date} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{day.date}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className="text-emerald-600 font-medium">{formatCurrency(day.income)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className="text-red-600 font-medium">{formatCurrency(day.expenses)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className={`font-semibold ${day.netChange >= 0 ? 'text-teal-600' : 'text-orange-600'}`}>
                          {formatCurrency(day.netChange)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">{day.transactionCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
