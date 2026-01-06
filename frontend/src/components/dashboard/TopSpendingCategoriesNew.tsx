import { TrendingDown, PiggyBank } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategorySpending } from '../../types';
import type { CardWidth } from '../../contexts/FeatureFlagsContext';

interface TopSpendingCategoriesProps {
  categories: CategorySpending[];
  width: CardWidth;
}

const COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      percentage: number;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="bg-white p-3 rounded-md shadow-xl border border-gray-300"
        style={{
          opacity: 1,
          transition: 'opacity 0.2s ease-in-out',
        }}
      >
        <p className="font-semibold text-gray-900 mb-1 text-sm">{payload[0].name}</p>
        <p className="text-sm text-gray-700 font-medium">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {payload[0].payload.percentage.toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

interface LabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: LabelProps) => {
  if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !percent) return null;
  const RADIAN = Math.PI / 180;
  // Position label exactly in the center of the slice
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Show all percentages, even small ones
  if (percent < 0.02) return null; // Only hide extremely tiny slices (less than 2%)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-bold drop-shadow-md"
      style={{ pointerEvents: 'none' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function TopSpendingCategories({ categories, width }: Readonly<TopSpendingCategoriesProps>) {
  const chartData = categories.map(cat => ({
    name: cat.categoryName,
    value: cat.amount ?? 0,
    percentage: cat.percentage ?? 0,
  }));

  const isFullWidth = width === 'full';

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
          <div className={`flex ${isFullWidth ? 'flex-row items-center' : 'flex-col'} gap-4`}>
            {/* Donut Chart */}
            <div className={`flex items-center justify-center ${isFullWidth ? 'flex-1' : 'w-full'}`}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomLabel}
                    outerRadius={isFullWidth ? 125 : 110}
                    innerRadius={isFullWidth ? 75 : 65}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={<CustomTooltip />} 
                      cursor={false}
                      animationDuration={200}
                      animationEasing="ease-out"
                      isAnimationActive={true}
                    />
                  </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend - Simple without percentages */}
            <div className={`grid ${isFullWidth ? 'grid-cols-1 flex-1' : 'grid-cols-2 sm:grid-cols-3'} gap-2`}>
              {categories.slice(0, 8).map((category, idx) => (
                <div key={category.categoryId} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {category.categoryName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
