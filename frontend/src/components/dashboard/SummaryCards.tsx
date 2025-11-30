import { TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react';
import type { DashboardStats } from '../../types';

interface SummaryCardsProps {
  stats: DashboardStats;
  formatCurrency: (amount: number) => string;
}

export function SummaryCards({ stats, formatCurrency }: Readonly<SummaryCardsProps>) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Income Card */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-emerald-300 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-emerald-50 rounded-lg">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>
          <span className="text-xs font-medium text-gray-500 uppercase">Income</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(stats.totalIncome)}</p>
        <p className="text-sm text-gray-600">This period</p>
      </div>

      {/* Expenses Card */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-red-300 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-red-50 rounded-lg">
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
          <span className="text-xs font-medium text-gray-500 uppercase">Expenses</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(stats.totalExpenses)}</p>
        <p className="text-sm text-gray-600">This period</p>
      </div>

      {/* Net Savings Card */}
      <div className={`bg-white rounded-lg p-6 border border-gray-200 hover:border-${stats.netSavings >= 0 ? 'teal' : 'orange'}-300 transition-colors`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-lg ${stats.netSavings >= 0 ? 'bg-teal-50' : 'bg-orange-50'}`}>
            <PiggyBank className={`h-6 w-6 ${stats.netSavings >= 0 ? 'text-teal-600' : 'text-orange-600'}`} />
          </div>
          <span className="text-xs font-medium text-gray-500 uppercase">Savings</span>
        </div>
        <p className={`text-2xl font-bold mb-1 ${stats.netSavings >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
          {formatCurrency(stats.netSavings)}
        </p>
        <p className="text-sm text-gray-600">
          {stats.netSavings >= 0 ? 'Saved' : 'Overspent'}
        </p>
      </div>

      {/* Total Balance Card */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-300 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-blue-50 rounded-lg">
            <Wallet className="h-6 w-6 text-blue-600" />
          </div>
          <span className="text-xs font-medium text-gray-500 uppercase">Balance</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(stats.totalBalance)}</p>
        <p className="text-sm text-gray-600">{stats.activeAccountsCount} accounts</p>
      </div>
    </div>
  );
}
