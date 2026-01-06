import { Target } from 'lucide-react';
import type { BudgetStatus } from '../../types';

interface BudgetStatusListProps {
  budgets: BudgetStatus[];
  formatCurrency: (amount: number) => string;
}

export function BudgetStatusList({ budgets, formatCurrency }: Readonly<BudgetStatusListProps>) {
  if (!budgets || budgets.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-purple-600 flex items-center gap-3">
        <div className="p-2 bg-purple-500 rounded-md">
          <Target className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Budget Status</h3>
          <p className="text-sm text-purple-100">Track your spending limits</p>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            let statusClass = 'bg-emerald-100 text-emerald-700';
            let progressClass = 'bg-emerald-500';
            
            if (budget.status === 'exceeded') {
              statusClass = 'bg-red-100 text-red-700';
              progressClass = 'bg-red-500';
            } else if (budget.status === 'warning') {
              statusClass = 'bg-amber-100 text-amber-700';
              progressClass = 'bg-amber-500';
            }

            return (
              <div 
                key={budget.budgetId} 
                className="rounded-lg p-4 border border-gray-200 bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{budget.budgetName}</h4>
                    {budget.categoryName && (
                      <p className="text-xs text-gray-500 mt-0.5">{budget.categoryName}</p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded ${statusClass}`}>
                    {budget.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span className="font-medium">{formatCurrency(budget.spentAmount)}</span>
                    <span>of {formatCurrency(budget.budgetAmount)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${progressClass}`}
                      style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-right font-medium">{budget.percentageUsed.toFixed(0)}% used</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
