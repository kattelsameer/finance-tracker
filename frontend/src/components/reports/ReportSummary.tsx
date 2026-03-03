import { TrendingUp, TrendingDown, ArrowRightLeft, BarChart3 } from 'lucide-react';
import { SecondaryCurrencyBadge } from '../ui/SecondaryCurrencyBadge';

interface ReportSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  formatCurrency: (amount: number) => string;
}

export function ReportSummary({ totalIncome, totalExpenses, netAmount, transactionCount, formatCurrency }: ReportSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">Total Income</span>
          <div className="p-2.5 bg-emerald-50 rounded-xl">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
        <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalIncome)}</p>
        <SecondaryCurrencyBadge amount={totalIncome} className="mt-1" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">Total Expenses</span>
          <div className="p-2.5 bg-red-50 rounded-xl">
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
        </div>
        <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalExpenses)}</p>
        <SecondaryCurrencyBadge amount={totalExpenses} className="mt-1" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">Net Amount</span>
          <div className={`p-2.5 rounded-xl ${netAmount >= 0 ? 'bg-teal-50' : 'bg-orange-50'}`}>
            <ArrowRightLeft className={`h-5 w-5 ${netAmount >= 0 ? 'text-teal-600' : 'text-orange-600'}`} />
          </div>
        </div>
        <p className={`text-2xl font-semibold ${netAmount >= 0 ? 'text-teal-600' : 'text-orange-600'}`}>
          {formatCurrency(netAmount)}
        </p>
        <SecondaryCurrencyBadge amount={Math.abs(netAmount)} className="mt-1" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">Transactions</span>
          <div className="p-2.5 bg-blue-50 rounded-xl">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <p className="text-2xl font-semibold text-gray-900">{transactionCount}</p>
      </div>
    </div>
  );
}
