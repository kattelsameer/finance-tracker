/**
 * Exchange rate service using the free fawazahmed0/exchange-api.
 *
 * Primary CDN:  https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{code}.min.json
 * Fallback CDN: https://latest.currency-api.pages.dev/v1/currencies/{code}.min.json
 *
 * Response: { "date": "YYYY-MM-DD", "{code}": { "eur": 0.92, "gbp": 0.79, ... } }
 *
 * No API key required, no rate limits, 200+ currencies, daily updated.
 */

const PRIMARY_BASE =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';
const FALLBACK_BASE =
  'https://latest.currency-api.pages.dev/v1/currencies';

/** Cache: "from_to" → { rate, fetchedAt } */
const rateCache = new Map<string, { rate: number; fetchedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function isCacheValid(fetchedAt: number): boolean {
  return Date.now() - fetchedAt < CACHE_TTL_MS;
}

/**
 * Fetch all rates for a given base currency code.
 * Returns a map of { "eur": 0.92, "gbp": 0.79, ... } where values are
 * "1 {fromCode} = X {targetCode}".
 */
async function fetchRatesForBase(fromCode: string): Promise<Record<string, number>> {
  const code = fromCode.toLowerCase();
  const urls = [
    `${PRIMARY_BASE}/${code}.min.json`,
    `${FALLBACK_BASE}/${code}.min.json`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data = await res.json() as Record<string, unknown>;
      const rates = data[code];
      if (rates && typeof rates === 'object') {
        return rates as Record<string, number>;
      }
    } catch {
      // try next URL
    }
  }

  throw new Error(`Could not fetch exchange rates for ${fromCode.toUpperCase()}`);
}

/**
 * Get the exchange rate from one currency to another.
 * Returns: 1 {fromCode} = {rate} {toCode}
 */
async function getRate(fromCode: string, toCode: string): Promise<number> {
  const from = fromCode.toUpperCase();
  const to = toCode.toUpperCase();

  if (from === to) return 1;

  const cacheKey = `${from}_${to}`;
  const cached = rateCache.get(cacheKey);
  if (cached && isCacheValid(cached.fetchedAt)) {
    return cached.rate;
  }

  const rates = await fetchRatesForBase(from);
  const rate = rates[to.toLowerCase()];
  if (rate == null || rate <= 0) {
    throw new Error(`Exchange rate not available for ${from} → ${to}`);
  }

  rateCache.set(cacheKey, { rate, fetchedAt: Date.now() });
  return rate;
}

/**
 * Convert an amount from one currency to another using live rates.
 */
async function convert(
  amount: number,
  fromCode: string,
  toCode: string
): Promise<{ convertedAmount: number; rate: number }> {
  const rate = await getRate(fromCode, toCode);
  return {
    // Preserve full precision — callers are responsible for display rounding
    convertedAmount: amount * rate,
    rate,
  };
}

export const exchangeRateService = { getRate, convert };
