import { useState, useEffect } from 'react';
import { X, AlertCircle, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AccountType, CreateAccountRequest } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { exchangeRateService } from '../../services/exchange-rate.service';
import { getCurrencySymbol } from '../../contexts/SecondaryCurrencyContext';

const SUPPORTED_CURRENCIES = [
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'रू' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
];

interface AccountFormProps {
  formData: CreateAccountRequest;
  accountTypes: AccountType[];
  isEditing: boolean;
  saving: boolean;
  serverError?: string | null;
  onSubmit: (data: CreateAccountRequest) => void;
  onChange?: (data: CreateAccountRequest) => void;
  onClose: () => void;
}

const ACCOUNT_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const accountSchema = z.object({
  accountName: z.string().min(1, 'Account name is required').trim(),
  accountTypeId: z.number().int().min(1, 'Account type is required'),
  currency: z.string().min(1, 'Currency is required').trim(),
  initialBalance: z.number({ invalid_type_error: 'Initial balance must be a number' }),
  colorCode: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export function AccountForm({ formData, accountTypes, isEditing, saving, serverError, onSubmit, onClose }: Readonly<AccountFormProps>) {
  const { user } = useAuth();
  const primaryCurrency = user?.defaultCurrency || 'NPR';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      accountName: formData.accountName || '',
      accountTypeId: formData.accountTypeId || (accountTypes[0]?.id ?? 0),
      currency: formData.currency || primaryCurrency,
      initialBalance: formData.initialBalance || 0,
      colorCode: formData.colorCode || ACCOUNT_COLORS[0],
    },
  });

  const currentColor = watch('colorCode');
  const initialBalance = watch('initialBalance');

  // Inline currency selector state — synced back to the 'currency' form field
  const [inputCurrency, setInputCurrency] = useState(formData.currency || primaryCurrency);
  const isForeignCurrency = inputCurrency !== primaryCurrency;

  // Keep form field in sync
  useEffect(() => {
    setValue('currency', inputCurrency);
  }, [inputCurrency, setValue]);

  const [convertedPreview, setConvertedPreview] = useState<string | null>(null);
  const [conversionLoading, setConversionLoading] = useState(false);

  useEffect(() => {
    if (!isForeignCurrency || !initialBalance || initialBalance <= 0) {
      setConvertedPreview(null);
      return;
    }
    let cancelled = false;
    setConversionLoading(true);
    (async () => {
      try {
        const { convertedAmount } = await exchangeRateService.convert(
          initialBalance, inputCurrency, primaryCurrency
        );
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
  }, [isForeignCurrency, initialBalance, inputCurrency, primaryCurrency]);

  const onFormSubmit = (data: AccountFormValues) => {
    onSubmit({
      accountName: data.accountName,
      accountTypeId: data.accountTypeId,
      currency: data.currency,
      initialBalance: data.initialBalance,
      colorCode: data.colorCode,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none' }}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" 
          onClick={onClose}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          role="button"
          tabIndex={0}
          aria-label="Close modal"
        />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Account' : 'Add Account'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">              {serverError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{serverError}</span>
                </div>
              )}            <div>
              <label htmlFor="accountName" className="block text-sm font-semibold text-gray-700 mb-2">
                Account Name
              </label>
              <input
                id="accountName"
                type="text"
                {...register('accountName')}
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 ${errors.accountName ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                placeholder="e.g., Main Checking"
              />
              {errors.accountName && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.accountName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="accountTypeId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  id="accountTypeId"
                  {...register('accountTypeId', { valueAsNumber: true })}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 ${errors.accountTypeId ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                >
                  {accountTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.typeName}</option>
                  ))}
                </select>
                {errors.accountTypeId && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.accountTypeId.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="initialBalance" className="block text-sm font-semibold text-gray-700 mb-2">
                  Initial Balance
                </label>
                <div className="flex">
                  <select
                    value={inputCurrency}
                    onChange={(e) => { setInputCurrency(e.target.value); setConvertedPreview(null); }}
                    className="px-2 py-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:z-10"
                    aria-label="Balance currency"
                  >
                    {SUPPORTED_CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                    ))}
                  </select>
                  <input
                    id="initialBalance"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    onFocus={(e) => e.target.select()}
                    {...register('initialBalance', { valueAsNumber: true })}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-r-xl focus:ring-2 focus:ring-blue-500 ${errors.initialBalance ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                  />
                </div>
                {errors.initialBalance && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.initialBalance.message}
                  </p>
                )}
              </div>
            </div>

            {/* Foreign currency conversion notice */}
            {isForeignCurrency && (
              <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <div className="text-xs leading-relaxed space-y-1">
                  <p className="font-semibold">Balance will be converted to {primaryCurrency}</p>
                  {initialBalance > 0 ? (
                    <p>
                      {getCurrencySymbol(inputCurrency)} {initialBalance} {inputCurrency} →{' '}
                      {conversionLoading
                        ? <span className="italic text-amber-600">converting…</span>
                        : convertedPreview
                          ? <strong className="text-green-700">{convertedPreview} {primaryCurrency}</strong>
                          : <span className="italic text-amber-600">rate unavailable</span>
                      }
                    </p>
                  ) : (
                    <p>Enter a balance above to see the {primaryCurrency} equivalent.</p>
                  )}
                  <p className="text-amber-600">The converted {primaryCurrency} amount will be saved.</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {ACCOUNT_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue('colorCode', color)}
                    className={`w-8 h-8 rounded-lg border-2 ${currentColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
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
                {saving ? 'Saving...' : isEditing ? 'Update Account' : 'Add Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
