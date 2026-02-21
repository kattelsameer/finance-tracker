import { useState, useEffect, useCallback } from 'react';
import { currencyService } from '../services/currency.service';
import type { Currency } from '../types';
import { ArrowDownUp, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';

// Default currencies as fallback when API fails
const DEFAULT_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
];

export function CurrencyConverter() {
  const [currencies, setCurrencies] = useState<Currency[]>(DEFAULT_CURRENCIES);
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetchCurrencies();
  }, []);

  const handleConvert = useCallback(async () => {
    const numAmount = Number.parseFloat(amount);
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      setConvertedAmount(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await currencyService.convert({
        amount: numAmount,
        fromCurrency,
        toCurrency
      });
      setConvertedAmount(result.convertedAmount);
      setExchangeRate(result.exchangeRate);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to convert currency');
    } finally {
      setLoading(false);
    }
  }, [amount, fromCurrency, toCurrency]);

  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      handleConvert();
    }
  }, [amount, fromCurrency, toCurrency, handleConvert]);

  const fetchCurrencies = async () => {
    try {
      const data = await currencyService.getAll();
      if (data && data.length > 0) {
        setCurrencies(data);
      }
    } catch {
      // Keep using default currencies on error - don't show error for this
      console.warn('Using default currencies - API unavailable');
    }
  };

  const handleRetry = () => {
    setError(null);
    handleConvert();
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatCurrency = (value: number, currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return `${currency?.symbol || currencyCode} ${value.toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
      <div className="px-6 py-4 bg-blue-600 flex items-center gap-3">
        <div className="p-2 bg-blue-500 rounded-md">
          <DollarSign className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Currency Converter</h3>
          <p className="text-sm text-blue-100">Real-time rates</p>
        </div>
      </div>
      
      <div className="p-6 space-y-5">
        {error && (
          <div className="flex items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Currency service unavailable</span>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 px-2 py-1 bg-amber-100 hover:bg-amber-200 rounded text-xs font-medium transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 font-medium text-sm">
                {currencies.find(c => c.code === fromCurrency)?.symbol || '$'}
              </span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
              placeholder="Enter amount"
              step="0.01"
            />
          </div>
        </div>

        {/* From Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwapCurrencies}
            className="p-2.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            title="Swap currencies"
          >
            <ArrowDownUp className="h-5 w-5" />
          </button>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>

        {/* Result */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
        ) : convertedAmount === null ? (
          <div className="mt-2 p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
            Enter an amount and click Convert to see the result
          </div>
        ) : (
          <div className="mt-2 p-5 bg-blue-600 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-blue-100 font-medium mb-3">
                {formatCurrency(Number.parseFloat(amount), fromCurrency)}
              </p>
              <p className="text-3xl font-bold text-white mb-4">
                {formatCurrency(convertedAmount, toCurrency)}
              </p>
              {exchangeRate && (
                <div className="inline-flex items-center gap-2 bg-blue-500 px-4 py-2 rounded-md">
                  <p className="text-sm text-white font-medium">
                    1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
