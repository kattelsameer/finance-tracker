import { useEffect, useState, useCallback } from 'react';
import { recurringTransactionService } from '../services/recurring-transaction.service';
import { useAuth } from '../contexts/AuthContext';
import type { RecurringTransaction, Frequency } from '../types';
import { RecurringList } from '../components/recurring';
import {
  Plus,
  Repeat,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export function RecurringTransactionsPage() {
  const { user } = useAuth();
  const defaultCurrency = user?.defaultCurrency || 'NPR';
  
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOnly, setActiveOnly] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);

  const fetchRecurringTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recurringTransactionService.getAll(activeOnly);
      setRecurringTransactions(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch recurring transactions');
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    fetchRecurringTransactions();
  }, [fetchRecurringTransactions]);

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await recurringTransactionService.update(id, { isActive: !currentStatus });
      fetchRecurringTransactions();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update recurring transaction');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return;
    
    try {
      await recurringTransactionService.delete(id);
      fetchRecurringTransactions();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete recurring transaction');
    }
  };

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    // TODO: Open edit modal when implemented
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: defaultCurrency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFrequencyLabel = (frequency: string): string => {
    const labels: Record<Frequency, string> = {
      DAILY: 'Daily',
      WEEKLY: 'Weekly',
      BIWEEKLY: 'Bi-weekly',
      MONTHLY: 'Monthly',
      QUARTERLY: 'Quarterly',
      YEARLY: 'Yearly'
    };
    return labels[frequency as Frequency] || frequency;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
        </div>
        <p className="mt-4 text-slate-600 font-medium">Loading recurring transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900">Recurring Transactions</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your scheduled transactions</p>
        </div>
        <button
          onClick={() => {/* TODO: Open create modal */}}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Recurring
        </button>
      </div>

      {/* Filter Toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label className="flex items-center cursor-pointer gap-3">
          <button
            onClick={() => setActiveOnly(!activeOnly)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              activeOnly ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                activeOnly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm font-medium text-gray-700">Show active only</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            activeOnly ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {recurringTransactions.length} {activeOnly ? 'active' : 'total'}
          </span>
        </label>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Edit Modal Placeholder - TODO: Implement RecurringTransactionForm modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Recurring Transaction</h3>
            <p className="text-sm text-gray-600 mb-4">
              Editing: <strong>{editingTransaction.description}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Full edit form coming soon. For now, you can toggle active status or delete from the list.
            </p>
            <button
              onClick={() => setEditingTransaction(null)}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Recurring Transactions List - Using RecurringList Component */}
      {recurringTransactions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Repeat className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No recurring transactions</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Set up recurring transactions for regular expenses and income like rent, subscriptions, or paychecks.
          </p>
          <button
            onClick={() => {/* TODO: Open create modal */}}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create your first recurring transaction
          </button>
        </div>
      ) : (
        <RecurringList
          transactions={recurringTransactions}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getFrequencyLabel={getFrequencyLabel}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}
    </div>
  );
}
