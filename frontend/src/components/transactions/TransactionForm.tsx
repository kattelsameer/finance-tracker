import { useState, useEffect } from 'react';
import { X, AlertCircle, Info } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Account, Category, CreateTransactionRequest } from '../../types';
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

interface TransactionFormProps {
  formData: CreateTransactionRequest;
  accounts: Account[];
  categories: Category[];
  isEditing: boolean;
  serverError?: string | null;
  onSubmit: (data: CreateTransactionRequest) => void;
  onChange?: (data: CreateTransactionRequest) => void;
  onClose: () => void;
}

const transactionSchema = z.object({
  transactionType: z.enum(['INCOME', 'EXPENSE', 'TRANSFER'] as const),
  accountId: z.number({ invalid_type_error: 'Account is required' }).int().min(1, 'Account is required'),
  transferToAccountId: z.number().int().optional().nullable(),
  amount: z.number({ invalid_type_error: 'Amount is required' }).min(0.01, 'Amount must be greater than 0'),
  transactionDate: z.string().min(1, 'Date is required'),
  categoryId: z.number().int().optional().nullable(),
  description: z.string().min(1, 'Description is required').trim(),
  notes: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.transactionType === 'TRANSFER' && !data.transferToAccountId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Transfer destination account is required',
      path: ['transferToAccountId'],
    });
  }
  if (data.transactionType !== 'TRANSFER' && !data.categoryId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Category is required',
      path: ['categoryId'],
    });
  }
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function TransactionForm({ 
  formData, 
  accounts, 
  categories, 
  isEditing, 
  serverError,
  onSubmit, 
  onClose 
}: Readonly<TransactionFormProps>) {
  const { user } = useAuth();
  const primaryCurrency = user?.defaultCurrency || 'NPR';
  const primarySymbol = getCurrencySymbol(primaryCurrency);

  const [inputCurrency, setInputCurrency] = useState(primaryCurrency);
  const [convertedPreview, setConvertedPreview] = useState<string | null>(null);
  const [conversionLoading, setConversionLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transactionType: formData.transactionType || 'EXPENSE',
      accountId: formData.accountId || undefined,
      transferToAccountId: formData.transferToAccountId || undefined,
      amount: formData.amount || undefined,
      transactionDate: formData.transactionDate || new Date().toISOString().split('T')[0],
      categoryId: formData.categoryId || undefined,
      description: formData.description || '',
      notes: formData.notes || '',
    },
  });

  const currentType = watch('transactionType');
  const activeAccountId = watch('accountId');
  const watchAmount = watch('amount');

  const isForeignCurrency = inputCurrency !== primaryCurrency;

  useEffect(() => {
    if (!isForeignCurrency || !watchAmount || watchAmount <= 0) {
      setConvertedPreview(null);
      return;
    }
    let cancelled = false;
    setConversionLoading(true);
    (async () => {
      try {
        const { convertedAmount } = await exchangeRateService.convert(watchAmount, inputCurrency, primaryCurrency);
        if (!cancelled) {
          setConvertedPreview(`${primarySymbol} ${convertedAmount.toFixed(2)}`);
        }
      } catch {
        if (!cancelled) setConvertedPreview(null);
      } finally {
        if (!cancelled) setConversionLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [watchAmount, inputCurrency, primaryCurrency, primarySymbol, isForeignCurrency]);

  const filteredCategories = categories.filter(cat => 
    currentType === 'TRANSFER' ? false : cat.categoryType === currentType
  );

  const onFormSubmit = async (data: TransactionFormValues) => {
    let finalAmount = data.amount;
    if (isForeignCurrency && data.amount > 0) {
      try {
        setSubmitting(true);
        const { convertedAmount } = await exchangeRateService.convert(data.amount, inputCurrency, primaryCurrency);
        finalAmount = Math.round(convertedAmount * 100) / 100;
      } catch {
        // fallback: save original amount if conversion fails
      } finally {
        setSubmitting(false);
      }
    }
    onSubmit({
      transactionType: data.transactionType,
      accountId: data.accountId,
      transferToAccountId: data.transferToAccountId ?? undefined,
      amount: finalAmount,
      currency: primaryCurrency,
      transactionDate: data.transactionDate,
      categoryId: data.categoryId ?? undefined,
      description: data.description,
      notes: data.notes ?? undefined,
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
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          aria-label="Close modal"
        />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
            {serverError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{serverError}</span>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['INCOME', 'EXPENSE', 'TRANSFER'] as const).map((type) => {
                  let buttonClass = 'bg-gray-100 text-gray-600 border-2 border-transparent';
                  
                  if (currentType === type) {
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
                      onClick={() => {
                        setValue('transactionType', type);
                        setValue('categoryId', null as any);
                        if (type !== 'TRANSFER') {
                          setValue('transferToAccountId', null as any);
                        }
                      }}
                      className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${buttonClass}`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="accountId" className="block text-sm font-semibold text-gray-700 mb-2">
                Account
              </label>
              <select
                id="accountId"
                {...register('accountId', { valueAsNumber: true })}
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 ${errors.accountId ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
              >
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.accountName}</option>
                ))}
              </select>
              {errors.accountId && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.accountId.message}
                </p>
              )}
            </div>

            {currentType === 'TRANSFER' && (
              <div>
                <label htmlFor="transferToAccountId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Transfer To
                </label>
                <select
                  id="transferToAccountId"
                  {...register('transferToAccountId', { valueAsNumber: true })}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 ${errors.transferToAccountId ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                >
                  <option value="">Select Account</option>
                  {accounts.filter(a => a.id !== activeAccountId).map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.accountName}</option>
                  ))}
                </select>
                {errors.transferToAccountId && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.transferToAccountId.message}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount
                </label>
                <div className="flex">
                  <select
                    value={inputCurrency}
                    onChange={(e) => { setInputCurrency(e.target.value); setConvertedPreview(null); }}
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
                    {...register('amount', { valueAsNumber: true })}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-r-xl focus:ring-2 focus:ring-blue-500 ${errors.amount ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.amount.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="transactionDate" className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  id="transactionDate"
                  type="date"
                  {...register('transactionDate')}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 ${errors.transactionDate ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.transactionDate && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.transactionDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Foreign currency conversion preview */}
            {isForeignCurrency && (
              <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <div className="text-xs leading-relaxed space-y-1">
                  <p className="font-semibold">Amount will be saved in {primaryCurrency}</p>
                  {watchAmount > 0 ? (
                    <p>
                      {getCurrencySymbol(inputCurrency)} {watchAmount} {inputCurrency} →{' '}
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

            {currentType !== 'TRANSFER' && (
              <div>
                <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="categoryId"
                  {...register('categoryId', { valueAsNumber: true })}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 ${errors.categoryId ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                >
                  <option value="">Select Category</option>
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <input
                id="description"
                type="text"
                {...register('description')}
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                placeholder="Enter description"
              />
              {errors.description && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                rows={2}
                {...register('notes')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Converting…' : isEditing ? 'Update' : 'Add'} Transaction
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
