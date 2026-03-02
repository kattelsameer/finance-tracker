import { TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react';
import type { DashboardStats } from '../../types';
import { SecondaryCurrencyBadge } from '../ui/SecondaryCurrencyBadge';

interface SummaryCardsProps {
  stats: DashboardStats;
  formatCurrency: (amount: number) => string;
}

export function SummaryCards({ stats, formatCurrency }: Readonly<SummaryCardsProps>) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Income Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-emerald-50 rounded-full">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Income</span>
        </div>
        <p className="text-xl lg:text-2xl font-bold tracking-tight text-gray-900 mb-1">{formatCurrency(stats.totalIncome)}</p>
        <SecondaryCurrencyBadge amount={stats.totalIncome} className="mb-1" />
        <p className="text-xs sm:text-sm text-gray-600">This period</p>
      </div>

      {/* Expenses Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 hover:border-red-300 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-red-50 rounded-full">
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</span>
        </div>
        <p className="text-xl lg:text-2xl font-bold tracking-tight text-gray-900 mb-1">{formatCurrency(stats.totalExpenses)}</p>
        <SecondaryCurrencyBadge amount={stats.totalExpenses} className="mb-1" />
        <p className="text-xs sm:text-sm text-gray-600">This period</p>
      </div>

      {/* Net Savings Card */}
      <div className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 hover:border-${stats.netSavings >= 0 ? 'teal' : 'orange'}-300 transition-all duration-300`}>
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-full ${stats.netSavings >= 0 ? 'bg-teal-50' : 'bg-orange-50'}`}>
            <PiggyBank className={`h-5 w-5 ${stats.netSavings >= 0 ? 'text-teal-600' : 'text-orange-600'}`} />
          </div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Savings</span>
        </div>
        <p className={`text-xl lg:text-2xl font-bold tracking-tight mb-1 ${stats.netSavings >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
          {formatCurrency(stats.netSavings)}
        </p>
        <p className="text-xs sm:text-sm text-gray-600">
          {stats.netSavings >= 0 ? 'Saved' : 'Overspent'}
        </p>
      </div>

      {/* Total Balance Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 hover:border-blue-300 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-blue-50 rounded-full">
            <Wallet className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</span>
        </div>
        <p className="text-xl lg:text-2xl font-bold tracking-tight text-gray-900 mb-1">{formatCurrency(stats.totalBalance)}</p>
        <SecondaryCurrencyBadge amount={stats.totalBalance} className="mb-1" />
        <p className="text-xs sm:text-sm text-gray-600">{stats.activeAccountsCount} accounts</p>
      </div>
    </div>
  );
}
