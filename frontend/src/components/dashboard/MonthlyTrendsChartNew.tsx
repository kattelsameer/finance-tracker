import { BarChart3 } from 'lucide-react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import type { MonthlyTrend } from '../../types';

interface MonthlyTrendsChartProps {
  trends: MonthlyTrend[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      month: string;
      income: number;
      expenses: number;
      net: number;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.month}</p>
        <div className="space-y-1 text-sm">
          <p className="text-emerald-600 font-medium">
            Income: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].payload.income)}
          </p>
          <p className="text-red-600 font-medium">
            Expenses: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].payload.expenses)}
          </p>
          <p className={`font-semibold ${payload[0].payload.net >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
            Net: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].payload.net)}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function MonthlyTrendsChartNew({ trends }: Readonly<MonthlyTrendsChartProps>) {
  // Transform data for recharts
  const chartData = trends.map(trend => ({
    month: trend.month,
    income: trend.income,
    expenses: trend.expenses,
    net: trend.income - trend.expenses,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[420px] transition-all duration-300 hover:shadow-md">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 shrink-0 z-10">
        <div className="p-2.5 bg-blue-50 rounded-full">
          <BarChart3 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">Monthly Trends</h3>
          <p className="text-sm text-gray-500">Income vs Expenses over time</p>
        </div>
      </div>
      <div className="p-6 overflow-y-auto scrollbar-hide flex-1 relative">
        {trends.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">No trend data available</p>
            <p className="text-sm text-gray-500">Data will appear as transactions are added</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar 
                dataKey="income" 
                fill="#10b981" 
                name="Income"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="expenses" 
                fill="#ef4444" 
                name="Expenses"
                radius={[4, 4, 0, 0]}
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="#0891b2" 
                strokeWidth={3}
                name="Net"
                dot={{ fill: '#0891b2', r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
