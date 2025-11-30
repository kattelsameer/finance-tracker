import { TrendingDown, PiggyBank } from 'lucide-react';
import type { CategorySpending } from '../../types';

interface TopSpendingCategoriesProps {
  categories: CategorySpending[];
  formatCurrency: (amount: number) => string;
}

export function TopSpendingCategories({ categories, formatCurrency }: Readonly<TopSpendingCategoriesProps>) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-red-600 flex items-center gap-3">
        <div className="p-2 bg-red-500 rounded-md">
          <TrendingDown className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Top Spending Categories</h3>
          <p className="text-sm text-red-100">Where your money goes</p>
        </div>
      </div>
      <div className="p-6">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <PiggyBank className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">No spending data available</p>
            <p className="text-sm text-gray-500">Start adding expenses to see insights</p>
          </div>
        ) : (
          <div className="space-y-5">
            {categories.map((category, idx) => (
              <div key={category.categoryId}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center text-sm font-semibold text-white">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{category.categoryName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(category.amount ?? 0)}</span>
                    <span className="text-xs text-gray-500 ml-2">{(category.percentage ?? 0).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-600 transition-all duration-300"
                    style={{ width: `${category.percentage ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
