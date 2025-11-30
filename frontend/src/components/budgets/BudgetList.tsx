import { Edit3, Trash2, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Budget } from '../../types';

interface BudgetListProps {
  budgets: Budget[];
  formatCurrency: (amount: number) => string;
  getPeriodLabel: (period: string) => string;
  onEdit: (budget: Budget) => void;
  onDelete: (id: number) => void;
}

export function BudgetList({ budgets, formatCurrency, getPeriodLabel, onEdit, onDelete }: BudgetListProps) {
  const getStatusColor = (percentageUsed: number) => {
    if (percentageUsed >= 100) return 'text-red-600';
    if (percentageUsed >= 80) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const getStatusIcon = (percentageUsed: number) => {
    if (percentageUsed >= 100) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (percentageUsed >= 80) return <TrendingUp className="h-5 w-5 text-amber-600" />;
    return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
  };

  const getProgressColor = (percentageUsed: number) => {
    if (percentageUsed >= 100) return 'bg-red-600';
    if (percentageUsed >= 80) return 'bg-amber-600';
    return 'bg-emerald-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {budgets.map((budget) => (
        <div key={budget.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(budget.percentUsed)}
              <div>
                <h3 className="font-bold text-gray-900">{budget.budgetName}</h3>
                <p className="text-sm text-gray-500">{getPeriodLabel(budget.periodType)}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(budget)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => onDelete(budget.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600">Spent</span>
              <span className={`text-xl font-bold ${getStatusColor(budget.percentUsed)}`}>
                {formatCurrency(budget.spent)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Budget</span>
              <span>{formatCurrency(budget.amount)}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getProgressColor(budget.percentUsed)}`}
                style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{budget.percentUsed.toFixed(1)}% used</span>
              <span className={getStatusColor(budget.percentUsed)}>
                {formatCurrency(budget.remaining)} left
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
