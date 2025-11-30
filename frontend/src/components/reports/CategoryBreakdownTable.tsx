import { PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import type { CategoryBreakdown } from '../../types';

interface CategoryBreakdownTableProps {
  categories: CategoryBreakdown[];
  formatCurrency: (amount: number) => string;
}

export function CategoryBreakdownTable({ categories, formatCurrency }: CategoryBreakdownTableProps) {
  return (
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
            {categories.map((cat) => (
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
  );
}
