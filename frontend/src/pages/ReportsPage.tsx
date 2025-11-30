import { useEffect, useState, useCallback } from 'react';
import { reportService } from '../services/report.service';
import { useAuth } from '../contexts/AuthContext';
import type { TransactionReport } from '../types';
import { ReportFilters, ReportSummary, CategoryBreakdownTable, AccountBreakdownTable } from '../components/reports';
import {
  FileDown,
  CalendarDays,
  AlertCircle
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

      {/* Date Range Filter - Using ReportFilters Component */}
      <ReportFilters
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onStartDateChange={(date) => setDateRange({ ...dateRange, startDate: date })}
        onEndDateChange={(date) => setDateRange({ ...dateRange, endDate: date })}
        onGenerate={fetchReport}
      />

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
          {/* Summary Cards - Using ReportSummary Component */}
          <ReportSummary
            totalIncome={report.totalIncome}
            totalExpenses={report.totalExpenses}
            netAmount={report.netAmount}
            transactionCount={report.transactionCount}
            formatCurrency={formatCurrency}
          />

          {/* Category Breakdown - Using CategoryBreakdownTable Component */}
          <CategoryBreakdownTable
            categories={report.categoryBreakdown}
            formatCurrency={formatCurrency}
          />

          {/* Account Breakdown - Using AccountBreakdownTable Component */}
          <AccountBreakdownTable
            accounts={report.accountBreakdown}
            formatCurrency={formatCurrency}
          />

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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.dailyBreakdown.map((day) => (
                    <tr key={day.date} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{day.date}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className="text-emerald-600 font-medium">{formatCurrency(day.income ?? 0)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className="text-red-600 font-medium">{formatCurrency(day.expenses ?? 0)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className={`font-semibold ${(day.netAmount ?? 0) >= 0 ? 'text-teal-600' : 'text-orange-600'}`}>
                          {formatCurrency(day.netAmount ?? 0)}
                        </span>
                      </td>
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
