import { X } from 'lucide-react';
import type { Category, CreateBudgetRequest, PeriodType } from '../../types';

interface BudgetFormProps {
  formData: CreateBudgetRequest;
  categories: Category[];
  isEditing: boolean;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: CreateBudgetRequest) => void;
  onClose: () => void;
}

const PERIODS: PeriodType[] = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];

export function BudgetForm({ formData, categories, isEditing, saving, onSubmit, onChange, onClose }: BudgetFormProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Budget' : 'Add Budget'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="budget-name" className="block text-sm font-semibold text-gray-700 mb-2">
                Budget Name
              </label>
              <input
                id="budget-name"
                type="text"
                value={formData.budgetName}
                onChange={(e) => onChange({ ...formData, budgetName: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Monthly Groceries"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                Category (Optional)
              </label>
              <select
                id="category"
                value={formData.categoryId ?? ''}
                onChange={(e) => onChange({ ...formData, categoryId: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => onChange({ ...formData, amount: Number.parseFloat(e.target.value) || 0 })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="period" className="block text-sm font-semibold text-gray-700 mb-2">
                  Period
                </label>
                <select
                  id="period"
                  value={formData.periodType}
                  onChange={(e) => onChange({ ...formData, periodType: e.target.value as PeriodType })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  {PERIODS.map(period => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="start-date" className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => onChange({ ...formData, startDate: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="alert-threshold" className="block text-sm font-semibold text-gray-700 mb-2">
                Alert Threshold (%)
              </label>
              <input
                id="alert-threshold"
                type="number"
                min="0"
                max="100"
                value={formData.alertThreshold}
                onChange={(e) => onChange({ ...formData, alertThreshold: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : isEditing ? 'Update' : 'Add'} Budget
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
