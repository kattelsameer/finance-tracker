export interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchangeRate?: number;
}

export interface CurrencyConversion {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  exchangeRate: number;
  timestamp: string;
}

export interface ConversionRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}

export interface ConvertAmountRequest {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}

export interface ConvertAmountResponse {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
}

// ── Currency change workflow ──────────────────────────────────────────────────

export type CurrencyChangeAction = 'CONVERT' | 'RESET';

export interface CurrencyChangeRequest {
  newCurrency: string;
  action: CurrencyChangeAction;
  /** Required when action === 'CONVERT' */
  exchangeRate?: number;
}

export interface CurrencyChangeResponse {
  previousCurrency: string;
  newCurrency: string;
  action: CurrencyChangeAction;
  accountsUpdated: number;
  transactionsUpdated: number;
  recurringUpdated: number;
  budgetsUpdated: number;
  message: string;
}
