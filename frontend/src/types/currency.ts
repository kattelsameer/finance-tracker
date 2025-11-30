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
