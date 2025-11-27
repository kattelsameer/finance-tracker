import { useEffect, useState } from 'react';
import { reportService } from '../services/report.service';
import type { TransactionReport } from '../types/api';

export function ReportsPage() {
  const [report, setReport] = useState<TransactionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getTransactionReport(
        dateRange.startDate,
        dateRange.endDate
      );
      setReport(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await reportService.exportToCSV(dateRange.startDate, dateRange.endDate);
      const filename = `transactions_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
      reportService.downloadCSV(blob, filename);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export CSV');
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
        <div className="text-gray-600">Loading report...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Transaction Reports</h1>
        <button
          onClick={handleExportCSV}
          disabled={!report}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
        >
          Export to CSV
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={fetchReport}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Generate Report
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {report && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
              <p className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(report.totalIncome)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
              <p className="mt-2 text-2xl font-bold text-red-600">{formatCurrency(report.totalExpenses)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Net Amount</h3>
              <p className={`mt-2 text-2xl font-bold ${report.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(report.netAmount)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Transactions</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">{report.transactionCount}</p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Category Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transactions</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.categoryBreakdown.map((cat) => (
                    <tr key={`${cat.categoryId}-${cat.categoryType}`}>
                      <td className="px-4 py-3 text-sm text-gray-900">{cat.categoryName}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          cat.categoryType === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {cat.categoryType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(cat.totalAmount)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{cat.transactionCount}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{cat.percentageOfTotal.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Account Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Account Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Income</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expenses</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Change</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transactions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.accountBreakdown.map((acc) => (
                    <tr key={acc.accountId}>
                      <td className="px-4 py-3 text-sm text-gray-900">{acc.accountName}</td>
                      <td className="px-4 py-3 text-sm text-right text-green-600">{formatCurrency(acc.income)}</td>
                      <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(acc.expenses)}</td>
                      <td className={`px-4 py-3 text-sm text-right ${acc.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(acc.netChange)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{acc.transactionCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Breakdown</h2>
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="sticky top-0 bg-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Income</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expenses</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transactions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.dailyBreakdown.map((day) => (
                    <tr key={day.date}>
                      <td className="px-4 py-3 text-sm text-gray-900">{day.date}</td>
                      <td className="px-4 py-3 text-sm text-right text-green-600">{formatCurrency(day.income)}</td>
                      <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(day.expenses)}</td>
                      <td className={`px-4 py-3 text-sm text-right ${day.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(day.netChange)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{day.transactionCount}</td>
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
