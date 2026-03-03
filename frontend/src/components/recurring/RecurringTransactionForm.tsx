import { useState, useEffect } from 'react';
import { X, AlertCircle, Info } from 'lucide-react';
import type { Account, Category, CreateRecurringTransactionRequest, Frequency } from '../../types';
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

interface RecurringTransactionFormProps {
  formData: CreateRecurringTransactionRequest;
  accounts: Account[];
  categories: Category[];
  isEditing: boolean;
  serverError?: string | null;
  inputCurrency: string;
  onInputCurrencyChange: (currency: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: CreateRecurringTransactionRequest) => void;
  onClose: () => void;
}

const FREQUENCY_OPTIONS: { value: Frequency; label: string; description: string }[] = [
  { value: 'DAILY', label: 'Daily', description: 'Every day' },
  { value: 'WEEKLY', label: 'Weekly', description: 'Every week' },
  { value: 'BIWEEKLY', label: 'Bi-weekly', description: 'Every 2 weeks' },
  { value: 'MONTHLY', label: 'Monthly', description: 'Every month' },
  { value: 'QUARTERLY', label: 'Quarterly', description: 'Every 3 months' },
  { value: 'YEARLY', label: 'Yearly', description: 'Every year' },
];

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

export function RecurringTransactionForm({ 
  formData, 
  accounts, 
  categories, 
  isEditing, 
  serverError,
  inputCurrency,
  onInputCurrencyChange,
  onSubmit, 
  onChange, 
  onClose 
}: Readonly<RecurringTransactionFormProps>) {
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

  const filteredCategories = categories.filter(cat => 
    formData.transactionType === 'TRANSFER' ? false : cat.categoryType === formData.transactionType
  );

  const showDayOfMonth = formData.frequency === 'MONTHLY' || formData.frequency === 'QUARTERLY' || formData.frequency === 'YEARLY';
  const showDayOfWeek = formData.frequency === 'WEEKLY' || formData.frequency === 'BIWEEKLY';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" 
          onClick={onClose}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          aria-label="Close modal"
        />
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
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
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['INCOME', 'EXPENSE', 'TRANSFER'] as const).map((type) => {
                  let buttonClass = 'bg-gray-100 text-gray-600 border-2 border-transparent';
                  
                  if (formData.transactionType === type) {
                    if (type === 'INCOME') {
                      buttonClass = 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500';
                    } else if (type === 'EXPENSE') {
                      buttonClass = 'bg-red-100 text-red-700 border-2 border-red-500';
                    } else {
                      buttonClass = 'bg-blue-100 text-blue-700 border-2 border-blue-500';
                    }
                  }

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onChange({ ...formData, transactionType: type, categoryId: undefined })}
                      className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${buttonClass}`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account */}
            <div>
              <label htmlFor="account" className="block text-sm font-semibold text-gray-700 mb-2">
                Account
              </label>
              <select
                id="account"
                value={formData.accountId}
                onChange={(e) => onChange({ ...formData, accountId: Number(e.target.value) })}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.accountName}</option>
                ))}
              </select>
            </div>

            {/* Transfer To Account */}
            {formData.transactionType === 'TRANSFER' && (
              <div>
                <label htmlFor="transfer-to" className="block text-sm font-semibold text-gray-700 mb-2">
                  Transfer To
                </label>
                <select
                  id="transfer-to"
                  value={formData.transferToAccountId || ''}
                  onChange={(e) => onChange({ ...formData, transferToAccountId: Number(e.target.value) })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Account</option>
                  {accounts.filter(a => a.id !== formData.accountId).map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.accountName}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Amount and Start Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount
                </label>
                <div className="flex">
                  <select
                    value={inputCurrency}
                    onChange={(e) => { onInputCurrencyChange(e.target.value); setConvertedPreview(null); }}
                    className="px-2 py-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:z-10"
                    aria-label="Amount currency"
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
                    placeholder="0.00"
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    onFocus={(e) => e.target.select()}
                    value={formData.amount === 0 ? '' : formData.amount}
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

            {/* Category (for INCOME/EXPENSE only) */}
            {formData.transactionType !== 'TRANSFER' && (
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.categoryId || ''}
                  onChange={(e) => onChange({ ...formData, categoryId: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category (Optional)</option>
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Frequency */}
            <div>
              <label htmlFor="frequency" className="block text-sm font-semibold text-gray-700 mb-2">
                Frequency
              </label>
              <select
                id="frequency"
                value={formData.frequency}
                onChange={(e) => onChange({ ...formData, frequency: e.target.value as Frequency })}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Frequency</option>
                {FREQUENCY_OPTIONS.map(freq => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label} - {freq.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Day of Week (for WEEKLY/BIWEEKLY) */}
            {showDayOfWeek && (
              <div>
                <label htmlFor="day-of-week" className="block text-sm font-semibold text-gray-700 mb-2">
                  Day of Week
                </label>
                <select
                  id="day-of-week"
                  value={formData.dayOfWeek || ''}
                  onChange={(e) => onChange({ ...formData, dayOfWeek: e.target.value ? Number(e.target.value) : undefined })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Day</option>
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Day of Month (for MONTHLY/QUARTERLY/YEARLY) */}
            {showDayOfMonth && (
              <div>
                <label htmlFor="day-of-month" className="block text-sm font-semibold text-gray-700 mb-2">
                  Day of Month (1-28)
                </label>
                <input
                  id="day-of-month"
                  type="number"
                  min="1"
                  max="28"
                  value={formData.dayOfMonth || ''}
                  onChange={(e) => onChange({ ...formData, dayOfMonth: e.target.value ? Number(e.target.value) : undefined })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter day (1-28)"
                />
                <p className="text-xs text-gray-500 mt-1">Limited to 1-28 to avoid issues with shorter months</p>
              </div>
            )}

            {/* End Date (Optional) */}
            <div>
              <label htmlFor="end-date" className="block text-sm font-semibold text-gray-700 mb-2">
                End Date (Optional)
              </label>
              <input
                id="end-date"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => onChange({ ...formData, endDate: e.target.value || undefined })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for ongoing recurring transaction</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <input
                id="description"
                type="text"
                value={formData.description}
                onChange={(e) => onChange({ ...formData, description: e.target.value })}
                required
                placeholder="e.g., Monthly rent payment"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Auto Post Toggle */}
            <div className="flex items-center">
              <input
                id="auto-post"
                type="checkbox"
                checked={formData.autoPost || false}
                onChange={(e) => onChange({ ...formData, autoPost: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="auto-post" className="ml-2 text-sm font-medium text-gray-700">
                Automatically post transactions when due
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors"
              >
                {isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
