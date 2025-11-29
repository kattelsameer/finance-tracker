import { useState, useEffect, useCallback } from 'react';
import { currencyService } from '../services/currency.service';
import type { Currency } from '../types/api';
import { ArrowDownUp, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';

export function CurrencyConverter() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState('NPR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const handleConvert = useCallback(async () => {
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
      setCurrencies(data);
    } catch {
      setError('Failed to fetch currencies');
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
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow h-full">
      <div className="px-7 py-6 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center gap-4">
        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
          <DollarSign className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white">Currency Converter</h3>
          <p className="text-sm text-blue-100 mt-1">Real-time rates</p>
        </div>
      </div>
      
      <div className="p-7 space-y-6">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2.5">Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-500 font-semibold text-base">
                {currencies.find(c => c.code === fromCurrency)?.symbol || '$'}
              </span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-base bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
              placeholder="Enter amount"
              step="0.01"
            />
          </div>
        </div>

        {/* From Currency */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2.5">From</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full px-4 py-3.5 text-base bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center py-2">
          <button
            onClick={handleSwapCurrencies}
            className="p-3.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-100 hover:border-blue-200 shadow-sm"
            title="Swap currencies"
          >
            <ArrowDownUp className="h-6 w-6" />
          </button>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2.5">To</label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full px-4 py-3.5 text-base bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
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
          <div className="flex items-center justify-center py-10">
            <RefreshCw className="h-7 w-7 text-blue-600 animate-spin" />
          </div>
        ) : convertedAmount !== null ? (
          <div className="mt-3 p-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
            <div className="text-center">
              <p className="text-base text-blue-100 font-semibold mb-4">
                {formatCurrency(parseFloat(amount), fromCurrency)}
              </p>
              <p className="text-4xl font-black text-white mb-5">
                {formatCurrency(convertedAmount, toCurrency)}
              </p>
              {exchangeRate && (
                <div className="inline-flex items-center gap-2.5 bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                  <p className="text-sm text-white font-bold">
                    1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
