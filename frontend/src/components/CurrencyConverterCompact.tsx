import { useState, useEffect, useCallback } from 'react';
import { currencyService } from '../services/currency.service';
import { exchangeRateService } from '../services/exchange-rate.service';
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
      const { convertedAmount: converted, rate } = await exchangeRateService.convert(
        numAmount,
        fromCurrency,
        toCurrency
      );
      setConvertedAmount(converted);
      setExchangeRate(rate);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Conversion failed';
      setError(msg);
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
        // Merge: always include DEFAULT_CURRENCIES entries missing from backend
        // (e.g. NPR if V18 migration hasn't run yet)
        const backendCodes = new Set(data.map((c) => c.code));
        const missing = DEFAULT_CURRENCIES.filter((c) => !backendCodes.has(c.code));
        setCurrencies([...data, ...missing]);
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="px-6 py-4 bg-blue-600 flex items-center gap-3 shrink-0">
        <div className="p-2 bg-blue-500 rounded-md">
          <DollarSign className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Currency Converter</h3>
          <p className="text-sm text-blue-100">Live exchange rates</p>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        {error && (
          <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="flex-1 truncate">{error}</span>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter amount"
            step="0.01"
          />
        </div>

        {/* From + Swap + To — inline layout */}
        <div>
          <div className="flex items-center mb-1">
            <span className="flex-1 text-xs font-medium text-gray-500">From</span>
            <span className="w-8" />
            <span className="flex-1 text-xs font-medium text-gray-500">To</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="flex-1 min-w-0 px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleSwapCurrencies}
              className="p-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
              title="Swap currencies"
            >
              <ArrowDownUp className="h-4 w-4" />
            </button>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="flex-1 min-w-0 px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result */}
        <div className="flex-1 flex flex-col justify-end">
          {loading ? (
            <div className="w-full flex items-center justify-center py-3">
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
            </div>
          ) : convertedAmount !== null ? (
            <div className="w-full p-3 bg-blue-600 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-blue-200 font-medium mb-1">
                  {formatCurrency(Number.parseFloat(amount), fromCurrency)}
                </p>
                <p className="text-2xl font-bold text-white mb-1 leading-tight">
                  {formatCurrency(convertedAmount, toCurrency)}
                </p>
                {exchangeRate && (
                  <p className="text-xs text-blue-200">
                    1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full p-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
              Enter an amount to see conversion
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
