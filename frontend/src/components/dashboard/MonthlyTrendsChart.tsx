import { BarChart3 } from 'lucide-react';
import type { MonthlyTrend } from '../../types';

interface MonthlyTrendsChartProps {
  trends: MonthlyTrend[];
  formatCurrency: (amount: number) => string;
}

export function MonthlyTrendsChart({ trends, formatCurrency }: Readonly<MonthlyTrendsChartProps>) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-blue-600 flex items-center gap-3">
        <div className="p-2 bg-blue-500 rounded-md">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Monthly Trends</h3>
          <p className="text-sm text-blue-100">Last 6 months</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Month</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Income</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Expenses</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {trends.map((trend) => (
              <tr key={trend.month} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{trend.month}</td>
                <td className="px-6 py-4 text-sm text-right text-emerald-600 font-medium">{formatCurrency(trend.income)}</td>
                <td className="px-6 py-4 text-sm text-right text-red-600 font-medium">{formatCurrency(trend.expenses)}</td>
                <td className={`px-6 py-4 text-sm text-right font-semibold ${trend.income - trend.expenses >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
                  {formatCurrency(trend.income - trend.expenses)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
