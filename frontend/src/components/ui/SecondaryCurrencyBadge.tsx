/**
 * SecondaryCurrencyBadge
 *
 * Renders a small badge showing the amount converted into the user's
 * secondary currency. Uses the SecondaryCurrencyContext for conversion.
 *
 * Usage:
 *   <SecondaryCurrencyBadge amount={1000} primaryCurrency="NPR" />
 *   // → renders a small badge like:  [$ 7.55]
 */

import { useState, useEffect } from 'react';
import { useSecondaryCurrency } from '../../contexts/SecondaryCurrencyContext';

interface Props {
  amount: number;
  primaryCurrency?: string;
  className?: string;
}

export function SecondaryCurrencyBadge({ amount, primaryCurrency, className = '' }: Props) {
  const { convertToSecondary, isEnabled, getCachedConversion } = useSecondaryCurrency();
  const [displayText, setDisplayText] = useState<string | null>(
    getCachedConversion(amount, primaryCurrency)?.formatted ?? null
  );

  useEffect(() => {
    if (!isEnabled) return;

    let cancelled = false;

    (async () => {
      const cached = getCachedConversion(amount, primaryCurrency);
      if (cached) {
        if (!cancelled) setDisplayText(cached.formatted);
        return;
      }
      const result = await convertToSecondary(amount, primaryCurrency);
      if (!cancelled && result) setDisplayText(result.formatted);
    })();

    return () => { cancelled = true; };
  }, [amount, primaryCurrency, isEnabled, convertToSecondary, getCachedConversion]);

  if (!isEnabled || !displayText) return null;

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 ${className}`}
      title="Secondary currency equivalent"
    >
      {displayText}
    </span>
  );
}
