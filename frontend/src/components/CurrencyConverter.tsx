import { useState, useEffect } from 'react';
import { currencyService } from '../services/currency.service';
import type { Currency } from '../types/api';

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
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Currency Converter</h2>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
            step="0.01"
          />
        </div>

        {/* From Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name} ({currency.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwapCurrencies}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Swap currencies"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name} ({currency.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Result */}
        {convertedAmount !== null && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">
                {formatCurrency(parseFloat(amount), fromCurrency)}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(convertedAmount, toCurrency)}
              </p>
              {exchangeRate && (
                <p className="text-xs text-gray-500 mt-2">
                  Exchange Rate: 1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
                </p>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-500">
            Converting...
          </div>
        )}

        {/* Last Updated Info */}
        {currencies.length > 0 && currencies[0].lastUpdated && (
          <p className="text-xs text-gray-400 text-center">
            Rates last updated: {new Date(currencies[0].lastUpdated).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
