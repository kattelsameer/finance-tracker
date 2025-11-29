import { useState, useEffect } from 'react';
import { currencyService } from '../services/currency.service';
import type { Currency } from '../types/api';
import { ArrowDownUp, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';

export function CurrencyConverter() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
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

  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      handleConvert();
    }
  }, [amount, fromCurrency, toCurrency]);

  const fetchCurrencies = async () => {
    try {
      const data = await currencyService.getAll();
      setCurrencies(data);
    } catch (err: any) {
      setError('Failed to fetch currencies');
    }
  };

  const handleConvert = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to convert currency');
    } finally {
      setLoading(false);
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <DollarSign className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-900">Currency Converter</h3>
      </div>
      
      <div className="p-6 space-y-5">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 font-medium">
                {currencies.find(c => c.code === fromCurrency)?.symbol || '$'}
              </span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
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
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
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
            className="p-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors border border-gray-200 hover:border-blue-200"
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
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
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
          <div className="mt-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">
                {formatCurrency(parseFloat(amount), fromCurrency)}
              </p>
              <p className="text-2xl font-semibold text-blue-600">
                {formatCurrency(convertedAmount, toCurrency)}
              </p>
              {exchangeRate && (
                <p className="text-xs text-gray-500 mt-3 bg-white inline-block px-3 py-1.5 rounded-lg border border-gray-200">
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
