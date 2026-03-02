/**
 * CurrencyChangeModal
 *
 * Shown when the user attempts to change their default currency.
 * Presents two options:
 *   1. CONVERT – fetch the live exchange rate, confirm, and convert all data.
 *   2. RESET   – confirm twice, then delete all financial data.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  RefreshCw,
  Trash2,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { exchangeRateService } from '../../services/exchange-rate.service';
import { settingsService } from '../../services/settings.service';

interface Props {
  isOpen: boolean;
  fromCurrency: string;
  toCurrency: string;
  onClose: () => void;
  /** Called with the new currency code on success */
  onSuccess: (newCurrency: string) => void;
}

type Step =
  | 'choose'        // pick CONVERT or RESET
  | 'convert-rate'  // show live rate, confirm convert
  | 'converting'    // progress indicator
  | 'reset-warn'    // final warning before reset
  | 'resetting'     // progress indicator
  | 'done';         // success

const CURRENCY_NAMES: Record<string, string> = {
  NPR: 'Nepalese Rupee',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  INR: 'Indian Rupee',
  JPY: 'Japanese Yen',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  NZD: 'New Zealand Dollar',
  SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar',
  KRW: 'South Korean Won',
  BRL: 'Brazilian Real',
  AED: 'UAE Dirham',
  THB: 'Thai Baht',
  IDR: 'Indonesian Rupiah',
  ZAR: 'South African Rand',
  MXN: 'Mexican Peso',
  CNY: 'Chinese Yuan',
};

export function CurrencyChangeModal({
  isOpen,
  fromCurrency,
  toCurrency,
  onClose,
  onSuccess,
}: Props) {
  const [step, setStep] = useState<Step>('choose');
  const [rate, setRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  // Reset state every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('choose');
      setRate(null);
      setDoneMessage('');
      setServerError(null);
      setRateError(null);
    }
  }, [isOpen]);

  const fetchRate = useCallback(async () => {
    setLoadingRate(true);
    setRateError(null);
    try {
      const r = await exchangeRateService.getRate(fromCurrency, toCurrency);
      setRate(r);
    } catch {
      setRateError('Could not fetch live exchange rate. Please check your internet connection.');
    } finally {
      setLoadingRate(false);
    }
  }, [fromCurrency, toCurrency]);

  const handleChooseConvert = () => {
    setStep('convert-rate');
    fetchRate();
  };

  const handleChooseReset = () => {
    setStep('reset-warn');
  };

  const handleConfirmConvert = async () => {
    if (!rate) return;
    setStep('converting');
    setServerError(null);
    try {
      const res = await settingsService.changeCurrency({
        newCurrency: toCurrency,
        action: 'CONVERT',
        exchangeRate: rate,
      });
      setDoneMessage(res.message);
      setStep('done');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e.response?.data?.message ?? 'Conversion failed. Please try again.');
      setStep('convert-rate');
    }
  };

  const handleConfirmReset = async () => {
    setStep('resetting');
    setServerError(null);
    try {
      const res = await settingsService.changeCurrency({
        newCurrency: toCurrency,
        action: 'RESET',
      });
      setDoneMessage(res.message);
      setStep('done');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e.response?.data?.message ?? 'Reset failed. Please try again.');
      setStep('reset-warn');
    }
  };

  const handleDone = () => {
    onSuccess(toCurrency);
    onClose();
  };

  if (!isOpen) return null;

  const fromName = CURRENCY_NAMES[fromCurrency] ?? fromCurrency;
  const toName = CURRENCY_NAMES[toCurrency] ?? toCurrency;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={step !== 'converting' && step !== 'resetting' ? onClose : undefined}
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Changing Default Currency</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                {fromCurrency} <ArrowRight className="h-3 w-3" /> {toCurrency}
              </p>
            </div>
          </div>
          {step !== 'converting' && step !== 'resetting' && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {/* ==== CHOOSE STEP ==== */}
          {step === 'choose' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Changing the default currency from{' '}
                  <span className="font-semibold text-gray-900">{fromCurrency} ({fromName})</span>{' '}
                  to{' '}
                  <span className="font-semibold text-gray-900">{toCurrency} ({toName})</span>{' '}
                  will impact your existing financial data.
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Please choose how you would like to proceed:
                </p>
              </div>

              {/* Option A — Convert */}
              <button
                onClick={handleChooseConvert}
                className="w-full text-left p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <RefreshCw className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">Convert Existing Data</p>
                    <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                      Fetch the live exchange rate and multiply all your transaction amounts,
                      account balances, and budget amounts by the rate.
                    </p>
                  </div>
                </div>
              </button>

              {/* Option B — Reset */}
              <button
                onClick={handleChooseReset}
                className="w-full text-left p-4 rounded-xl border-2 border-red-200 bg-red-50 hover:border-red-400 hover:bg-red-100 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Trash2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-900 text-sm">Start Fresh (Reset Data)</p>
                    <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                      Permanently delete all your accounts, transactions, budgets, and recurring
                      transactions. You will start fresh in {toCurrency}.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* ==== CONVERT-RATE STEP ==== */}
          {step === 'convert-rate' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-1">Live Exchange Rate</p>
                {loadingRate ? (
                  <div className="flex items-center gap-2 text-blue-700 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Fetching rate from exchange API…</span>
                  </div>
                ) : rateError ? (
                  <div className="space-y-2">
                    <p className="text-red-600 text-sm">{rateError}</p>
                    <button
                      onClick={fetchRate}
                      className="text-sm text-blue-600 underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : rate !== null ? (
                  <p className="text-2xl font-bold text-blue-900">
                    1 {fromCurrency}{' '}
                    <span className="text-gray-400 text-lg">= </span>
                    {rate.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}{' '}
                    {toCurrency}
                  </p>
                ) : null}
              </div>

              {serverError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                  {serverError}
                </p>
              )}

              <p className="text-xs text-gray-500 leading-relaxed">
                All balances, transaction amounts, budgets and recurring amounts will be
                multiplied by this rate. This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('choose')}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmConvert}
                  disabled={!rate || loadingRate}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Convert Data
                </button>
              </div>
            </div>
          )}

          {/* ==== CONVERTING PROGRESS ==== */}
          {step === 'converting' && (
            <div className="py-8 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-100" />
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin absolute inset-0" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">Converting your data…</p>
                <p className="text-sm text-gray-500 mt-1">
                  Updating transactions, balances, budgets and more.
                </p>
              </div>
              {/* Fake progress bar for UX */}
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
              </div>
            </div>
          )}

          {/* ==== RESET WARNING ==== */}
          {step === 'reset-warn' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">This cannot be undone!</p>
                  <p className="text-sm text-red-700 mt-1 leading-relaxed">
                    This will permanently delete ALL of your:
                  </p>
                  <ul className="text-sm text-red-700 mt-1 list-disc list-inside space-y-0.5">
                    <li>Accounts and balances</li>
                    <li>Transactions (all history)</li>
                    <li>Budgets</li>
                    <li>Recurring transactions</li>
                  </ul>
                </div>
              </div>

              {serverError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                  {serverError}
                </p>
              )}

              <p className="text-sm text-gray-600">
                Your new default currency will be set to{' '}
                <strong>{toCurrency} ({toName})</strong>.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('choose')}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Yes, Delete All Data
                </button>
              </div>
            </div>
          )}

          {/* ==== RESETTING PROGRESS ==== */}
          {step === 'resetting' && (
            <div className="py-8 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-red-100" />
                <Loader2 className="h-16 w-16 text-red-500 animate-spin absolute inset-0" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">Resetting your data…</p>
                <p className="text-sm text-gray-500 mt-1">
                  Deleting financial data and switching currency.
                </p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {/* ==== DONE ==== */}
          {step === 'done' && (
            <div className="py-6 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-9 w-9 text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">
                  Currency changed to {toCurrency}!
                </p>
                {doneMessage && (
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{doneMessage}</p>
                )}
              </div>
              <button
                onClick={handleDone}
                className="w-full px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
