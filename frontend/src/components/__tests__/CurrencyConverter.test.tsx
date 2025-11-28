import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CurrencyConverter } from '../CurrencyConverter';
import { currencyService } from '../../services/currency.service';

// Mock the currency service
vi.mock('../../services/currency.service', () => ({
  currencyService: {
    getAll: vi.fn(),
    convert: vi.fn(),
  },
}));

const mockCurrencies = [
  { id: 1, code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1 },
  { id: 2, code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.85 },
  { id: 3, code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.73 },
];

describe('CurrencyConverter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (currencyService.getAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockCurrencies);
    (currencyService.convert as ReturnType<typeof vi.fn>).mockResolvedValue({
      convertedAmount: 85,
      exchangeRate: 0.85,
    });
  });

  it('renders the currency converter', async () => {
    render(<CurrencyConverter />);
    
    await waitFor(() => {
      expect(screen.getByText('Currency Converter')).toBeInTheDocument();
    });
  });

  it('loads currencies on mount', async () => {
    render(<CurrencyConverter />);
    
    await waitFor(() => {
      expect(currencyService.getAll).toHaveBeenCalled();
    });
  });

  it('displays amount input field', async () => {
    render(<CurrencyConverter />);
    
    const amountInput = await screen.findByRole('spinbutton');
    expect(amountInput).toBeInTheDocument();
    expect(amountInput).toHaveValue(100);
  });

  it('converts currency when amount changes', async () => {
    const user = userEvent.setup();
    render(<CurrencyConverter />);
    
    const amountInput = await screen.findByRole('spinbutton');
    await user.clear(amountInput);
    await user.type(amountInput, '200');
    
    await waitFor(() => {
      expect(currencyService.convert).toHaveBeenCalled();
    });
  });

  it('handles conversion errors gracefully', async () => {
    (currencyService.convert as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Conversion failed')
    );
    
    render(<CurrencyConverter />);
    
    await waitFor(() => {
      // Component should still render without crashing
      expect(screen.getByText('Currency Converter')).toBeInTheDocument();
    });
  });
});
