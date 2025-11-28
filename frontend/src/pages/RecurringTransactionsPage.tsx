import { useEffect, useState } from 'react';
import { recurringTransactionService } from '../services/recurring-transaction.service';
import type { RecurringTransaction, Frequency, TransactionType } from '../types/api';

export function RecurringTransactionsPage() {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOnly, setActiveOnly] = useState(true);

  useEffect(() => {
    fetchRecurringTransactions();
  }, [activeOnly]);

  const fetchRecurringTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recurringTransactionService.getAll(activeOnly);
      setRecurringTransactions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch recurring transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await recurringTransactionService.update(id, { isActive: !currentStatus });
      fetchRecurringTransactions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update recurring transaction');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return;
    
    try {
      await recurringTransactionService.delete(id);
      fetchRecurringTransactions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete recurring transaction');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFrequencyLabel = (frequency: Frequency): string => {
    const labels: Record<Frequency, string> = {
      DAILY: 'Daily',
      WEEKLY: 'Weekly',
      BIWEEKLY: 'Bi-weekly',
      MONTHLY: 'Monthly',
      QUARTERLY: 'Quarterly',
      YEARLY: 'Yearly'
    };
    return labels[frequency];
  };

  const getTransactionTypeColor = (type: TransactionType) => {
    switch (type) {
      case 'INCOME':
        return 'bg-green-100 text-green-800';
      case 'EXPENSE':
        return 'bg-red-100 text-red-800';
      case 'TRANSFER':
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading recurring transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Recurring Transactions</h1>
        <button
          onClick={() => {/* TODO: Open create modal */}}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + New Recurring Transaction
        </button>
      </div>

      {/* Filter Toggle */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Show active only</span>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Recurring Transactions List */}
      {recurringTransactions.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No recurring transactions found.</p>
          <button
            onClick={() => {/* TODO: Open create modal */}}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create your first recurring transaction
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recurringTransactions.map((recurring) => (
            <div
              key={recurring.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {recurring.description || 'Recurring Transaction'}
                  </h3>
                  <p className="text-sm text-gray-500">{recurring.accountName}</p>
                  {recurring.categoryName && (
                    <p className="text-xs text-gray-400">{recurring.categoryName}</p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded ${getTransactionTypeColor(recurring.transactionType)}`}>
                  {recurring.transactionType}
                </span>
              </div>

              {/* Amount */}
              <div className="mb-4">
                <p className={`text-2xl font-bold ${
                  recurring.transactionType === 'INCOME' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(recurring.amount)}
                </p>
              </div>

              {/* Frequency and Schedule */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{getFrequencyLabel(recurring.frequency)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Next: {formatDate(recurring.nextOccurrence)}</span>
                </div>
                {recurring.endDate && (
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Ends: {formatDate(recurring.endDate)}</span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                  recurring.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {recurring.isActive ? '● Active' : '○ Inactive'}
                </span>
                {recurring.autoPost && recurring.isActive && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                    Auto-post enabled
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(recurring.id, recurring.isActive)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {recurring.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => {/* TODO: Open edit modal */}}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(recurring.id)}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
