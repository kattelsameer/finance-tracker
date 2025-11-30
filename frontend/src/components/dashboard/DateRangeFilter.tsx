import { Calendar } from 'lucide-react';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function DateRangeFilter({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}: Readonly<DateRangeFilterProps>) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center gap-3 bg-white rounded-lg px-5 py-3 border border-gray-200 shadow-sm">
        <div className="p-2 bg-blue-50 rounded-md">
          <Calendar className="h-4 w-4 text-blue-600" />
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <span className="text-gray-400 text-sm">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
