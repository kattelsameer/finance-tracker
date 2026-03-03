/**
 * CurrencyConversionBadge
 *
 * Shows an amount converted from one explicit currency to another.
 * Used for foreign-currency accounts to display the primary-currency equivalent.
 *
 * Usage:
 *   <CurrencyConversionBadge amount={100} fromCurrency="INR" toCurrency="NPR" />
 *   // → renders a badge like:  [रू 154.23]
 */

import { useState, useEffect, useRef } from 'react';
import { exchangeRateService } from '../../services/exchange-rate.service';
import { getCurrencySymbol } from '../../contexts/SecondaryCurrencyContext';

interface Props {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  className?: string;
}

export function CurrencyConversionBadge({
  amount,
  fromCurrency,
  toCurrency,
  className = '',
}: Props) {
  const [displayText, setDisplayText] = useState<string | null>(null);
  const prevKey = useRef<string>('');

  useEffect(() => {
    if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return;

    const key = `${fromCurrency}_${toCurrency}_${amount}`;
    if (key === prevKey.current) return;
    prevKey.current = key;

    let cancelled = false;

    (async () => {
      try {
        const { convertedAmount } = await exchangeRateService.convert(amount, fromCurrency, toCurrency);
        if (!cancelled) {
          const symbol = getCurrencySymbol(toCurrency);
          setDisplayText(`${symbol} ${convertedAmount.toFixed(2)}`);
        }
      } catch {
        // silently skip if rate unavailable
      }
    })();

    return () => { cancelled = true; };
  }, [amount, fromCurrency, toCurrency]);

  if (!displayText || fromCurrency === toCurrency) return null;

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100 ${className}`}
      title={`≈ ${toCurrency} equivalent`}
    >
      {displayText}
    </span>
  );
}
