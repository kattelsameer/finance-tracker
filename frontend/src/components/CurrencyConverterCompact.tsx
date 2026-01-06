import { useState, useEffect, useCallback } from 'react';
import { currencyService } from '../services/currency.service';
import type { Currency } from '../types';
import { ArrowDownUp, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';

// Default currencies with NPR included
const DEFAULT_CURRENCIES: Currency[] = [
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'रू' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];

export function CurrencyConverterCompact() {
  const [currencies, setCurrencies] = useState<Currency[]>(DEFAULT_CURRENCIES);
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('NPR');
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
      setError(error.response?.data?.message || 'Failed to convert');
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
      console.warn('Using default currencies - API unavailable');
    }
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 bg-blue-600 flex items-center gap-2">
        <div className="p-1.5 bg-blue-500 rounded-md">
          <DollarSign className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Currency Converter</h3>
        </div>
      </div>
      
      <div className="p-4 space-y-3 flex-1">
        {error && (
          <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">Service unavailable</span>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter amount"
            step="0.01"
          />
        </div>

        {/* From Currency */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">From</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="p-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            title="Swap currencies"
          >
            <ArrowDownUp className="h-4 w-4" />
          </button>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">To</label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
          </div>
        ) : convertedAmount !== null ? (
          <div className="mt-2 p-3 bg-blue-600 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-blue-100 font-medium mb-2">
                {formatCurrency(Number.parseFloat(amount), fromCurrency)}
              </p>
              <p className="text-xl font-bold text-white mb-2">
                {formatCurrency(convertedAmount, toCurrency)}
              </p>
              {exchangeRate && (
                <p className="text-xs text-blue-100">
                  1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
