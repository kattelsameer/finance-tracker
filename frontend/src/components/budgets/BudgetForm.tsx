import { useState, useEffect } from 'react';
import { X, AlertCircle, Info } from 'lucide-react';
import type { Category, CreateBudgetRequest, PeriodType } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { getCurrencySymbol } from '../../contexts/SecondaryCurrencyContext';
import { exchangeRateService } from '../../services/exchange-rate.service';

const SUPPORTED_CURRENCIES = [
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'रू' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
];

interface BudgetFormProps {
  formData: CreateBudgetRequest;
  categories: Category[];
  isEditing: boolean;
  saving: boolean;
  serverError?: string | null;
  inputCurrency: string;
  onInputCurrencyChange: (currency: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: CreateBudgetRequest) => void;
  onClose: () => void;
}

const PERIODS: PeriodType[] = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];

export function BudgetForm({ formData, categories, isEditing, saving, serverError, inputCurrency, onInputCurrencyChange, onSubmit, onChange, onClose }: BudgetFormProps) {
  const { user } = useAuth();
  const primaryCurrency = user?.defaultCurrency || 'NPR';
  const isForeignCurrency = inputCurrency !== primaryCurrency;

  const [convertedPreview, setConvertedPreview] = useState<string | null>(null);
  const [conversionLoading, setConversionLoading] = useState(false);

  useEffect(() => {
    if (!isForeignCurrency || !formData.amount || formData.amount <= 0) {
      setConvertedPreview(null);
      return;
    }
    let cancelled = false;
    setConversionLoading(true);
    (async () => {
      try {
        const { convertedAmount } = await exchangeRateService.convert(formData.amount, inputCurrency, primaryCurrency);
        if (!cancelled) {
          const sym = getCurrencySymbol(primaryCurrency);
          setConvertedPreview(`${sym} ${convertedAmount.toFixed(2)}`);
        }
      } catch {
        if (!cancelled) setConvertedPreview(null);
      } finally {
        if (!cancelled) setConversionLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isForeignCurrency, formData.amount, inputCurrency, primaryCurrency]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none' }}
    >
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
            {serverError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{serverError}</span>
              </div>
            )}
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
                <div className="flex">
                  <select
                    value={inputCurrency}
                    onChange={(e) => { onInputCurrencyChange(e.target.value); setConvertedPreview(null); }}
                    className="px-2 py-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:z-10"
                    aria-label="Budget currency"
                  >
                    {SUPPORTED_CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                    ))}
                  </select>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount === 0 ? '' : formData.amount}
                    placeholder="0.00"
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = Number.parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0) onChange({ ...formData, amount: val });
                      else if (e.target.value === '') onChange({ ...formData, amount: 0 });
                    }}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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

            {/* Foreign currency conversion notice */}
            {isForeignCurrency && (
              <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <div className="text-xs leading-relaxed space-y-1">
                  <p className="font-semibold">Amount will be saved in {primaryCurrency}</p>
                  {formData.amount > 0 ? (
                    <p>
                      {getCurrencySymbol(inputCurrency)} {formData.amount} {inputCurrency} →{' '}
                      {conversionLoading
                        ? <span className="italic text-amber-600">converting…</span>
                        : convertedPreview
                          ? <strong className="text-green-700">{convertedPreview} {primaryCurrency}</strong>
                          : <span className="italic text-amber-600">rate unavailable</span>
                      }
                    </p>
                  ) : (
                    <p>Enter an amount above to see the {primaryCurrency} equivalent.</p>
                  )}
                </div>
              </div>
            )}

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
