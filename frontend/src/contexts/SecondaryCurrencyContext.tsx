/**
 * SecondaryCurrencyContext
 *
 * Provides secondary-currency conversion state across the entire app.
 *
 * - Reads the user's secondary currency from the auth context.
 * - Exposes `convertToSecondary(amount, primaryCurrency)` which returns the
 *   converted amount and rate in real time via the exchange-rate service.
 * - Exposes `formatSecondary(amount, primaryCurrency)` for a formatted string.
 * - All conversion results are cached by the exchange-rate service (5 min TTL).
 */

/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { useAuth } from '../hooks/useAuth';
import { exchangeRateService } from '../services/exchange-rate.service';

// Currency symbols lookup (extends what the exchange-rate API provides)
const CURRENCY_SYMBOLS: Record<string, string> = {
  NPR: 'रू',
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CNY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  NZD: 'NZ$',
  SGD: 'S$',
  HKD: 'HK$',
  KRW: '₩',
  BRL: 'R$',
  ZAR: 'R',
  AED: 'د.إ',
  THB: '฿',
  IDR: 'Rp',
  MXN: '$',
};

export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code?.toUpperCase()] ?? code;
}

// ---------------------------------------------------------------------------

interface ConversionResult {
  convertedAmount: number;
  rate: number;
  formatted: string;
}

interface SecondaryCurrencyContextType {
  /** The currently selected secondary currency code, or null if none */
  secondaryCurrency: string | null;
  /** Change the secondary currency (persists to user profile via auth service) */
  setSecondaryCurrency: (code: string | null) => void;
  /**
   * Asynchronously convert an amount from the primary currency to the
   * secondary currency. Returns null while the rate is being fetched.
   */
  convertToSecondary: (
    amount: number,
    primaryCurrency?: string
  ) => Promise<ConversionResult | null>;
  /**
   * Returns a cached conversion result synchronously (null until first fetch).
   */
  getCachedConversion: (
    amount: number,
    primaryCurrency?: string
  ) => ConversionResult | null;
  /** Whether the secondary currency is enabled (non-null AND badge display toggled on) */
  isEnabled: boolean;
  /** Whether the secondary currency badge display is toggled on globally */
  showSecondaryBadge: boolean;
  /** Toggle the secondary currency badge display globally (persisted to localStorage) */
  setShowSecondaryBadge: (val: boolean) => void;
}

const SecondaryCurrencyContext = createContext<SecondaryCurrencyContextType | undefined>(
  undefined
);

// In-memory result cache: "from_to_amount" → ConversionResult
const resultCache = new Map<string, ConversionResult>();

export function SecondaryCurrencyProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { user, refetchUser } = useAuth();

  const [secondaryCurrency, setSecondaryCurrencyLocal] = useState<string | null>(
    user?.secondaryCurrency ?? null
  );

  const [showSecondaryBadge, setShowSecondaryBadgeLocal] = useState<boolean>(
    () => localStorage.getItem('showSecondaryCurrencyBadge') === 'true'
  );

  // Sync with user profile changes
  useEffect(() => {
    setSecondaryCurrencyLocal(user?.secondaryCurrency ?? null);
  }, [user?.secondaryCurrency]);

  const setSecondaryCurrency = useCallback(
    async (code: string | null) => {
      setSecondaryCurrencyLocal(code);
      // Persist to backend
      try {
        const { authService } = await import('../services/auth.service');
        await authService.updateProfile({ secondaryCurrency: code ?? '' });
        await refetchUser();
      } catch (err) {
        console.error('Failed to persist secondary currency preference:', err);
      }
    },
    [refetchUser]
  );

  const setShowSecondaryBadge = useCallback((val: boolean) => {
    setShowSecondaryBadgeLocal(val);
    localStorage.setItem('showSecondaryCurrencyBadge', String(val));
  }, []);

  const convertToSecondary = useCallback(
    async (amount: number, primaryCurrency?: string): Promise<ConversionResult | null> => {
      if (!secondaryCurrency) return null;
      const from = (primaryCurrency ?? user?.defaultCurrency ?? 'NPR').toUpperCase();
      const to = secondaryCurrency.toUpperCase();
      if (from === to) return null;

      const cacheKey = `${from}_${to}_${amount}`;
      const cached = resultCache.get(cacheKey);
      if (cached) return cached;

      try {
        const { convertedAmount, rate } = await exchangeRateService.convert(amount, from, to);
        const sym = getCurrencySymbol(to);
        // Use up to 4 decimal places so the displayed value round-trips
        // accurately through the currency converter (avoids 0.58 NPR drift).
        const result: ConversionResult = {
          convertedAmount,
          rate,
          formatted: `${sym} ${convertedAmount.toLocaleString('en', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        };
        resultCache.set(cacheKey, result);
        return result;
      } catch {
        return null;
      }
    },
    [secondaryCurrency, user?.defaultCurrency]
  );

  const getCachedConversion = useCallback(
    (amount: number, primaryCurrency?: string): ConversionResult | null => {
      if (!secondaryCurrency) return null;
      const from = (primaryCurrency ?? user?.defaultCurrency ?? 'NPR').toUpperCase();
      const to = secondaryCurrency.toUpperCase();
      if (from === to) return null;
      return resultCache.get(`${from}_${to}_${amount}`) ?? null;
    },
    [secondaryCurrency, user?.defaultCurrency]
  );

  const value = useMemo<SecondaryCurrencyContextType>(
    () => ({
      secondaryCurrency,
      setSecondaryCurrency,
      convertToSecondary,
      getCachedConversion,
      isEnabled: showSecondaryBadge && secondaryCurrency !== null && secondaryCurrency !== '',
      showSecondaryBadge,
      setShowSecondaryBadge,
    }),
    [secondaryCurrency, setSecondaryCurrency, convertToSecondary, getCachedConversion, showSecondaryBadge, setShowSecondaryBadge]
  );

  return (
    <SecondaryCurrencyContext.Provider value={value}>
      {children}
    </SecondaryCurrencyContext.Provider>
  );
}

export function useSecondaryCurrency(): SecondaryCurrencyContextType {
  const ctx = useContext(SecondaryCurrencyContext);
  if (!ctx) {
    throw new Error('useSecondaryCurrency must be used within a SecondaryCurrencyProvider');
  }
  return ctx;
}
