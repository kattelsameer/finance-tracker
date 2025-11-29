import { useEffect, useState, useCallback } from 'react';
import { recurringTransactionService } from '../services/recurring-transaction.service';
import { useAuth } from '../contexts/AuthContext';
import type { RecurringTransaction, Frequency, TransactionType } from '../types/api';
import {
  Plus,
  Repeat,
  Calendar,
  Clock,
  AlertCircle,
  Trash2,
  Edit3,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Zap,
  CalendarOff,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft
} from 'lucide-react';

export function RecurringTransactionsPage() {
  const { user } = useAuth();
  const defaultCurrency = user?.defaultCurrency || 'NPR';
  
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOnly, setActiveOnly] = useState(true);

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

  const getTransactionTypeConfig = (type: TransactionType) => {
    switch (type) {
      case 'INCOME':
        return { 
          bg: 'bg-emerald-100', 
          text: 'text-emerald-700', 
          icon: TrendingUp,
          amountColor: 'text-emerald-600'
        };
      case 'EXPENSE':
        return { 
          bg: 'bg-rose-100', 
          text: 'text-rose-700', 
          icon: TrendingDown,
          amountColor: 'text-rose-600'
        };
      case 'TRANSFER':
        return { 
          bg: 'bg-blue-100', 
          text: 'text-blue-700', 
          icon: ArrowRightLeft,
          amountColor: 'text-blue-600'
        };
    }
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

      {/* Empty State */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recurringTransactions.map((recurring) => {
            const typeConfig = getTransactionTypeConfig(recurring.transactionType);
            const TypeIcon = typeConfig.icon;
            
            return (
              <div
                key={recurring.id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${
                  recurring.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'
                }`}
              >
                {/* Card Header */}
                <div className="px-4 py-3.5 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {recurring.description || 'Recurring Transaction'}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{recurring.accountName}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${typeConfig.bg} ${typeConfig.text}`}>
                      <TypeIcon className="h-3 w-3" />
                      {recurring.transactionType}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-4 py-4 space-y-3">
                  {/* Amount */}
                  <p className={`text-2xl font-bold ${typeConfig.amountColor}`}>
                    {formatCurrency(recurring.amount)}
                  </p>

                  {/* Schedule Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{getFrequencyLabel(recurring.frequency)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Next: <strong>{formatDate(recurring.nextOccurrence)}</strong></span>
                    </div>
                    {recurring.endDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarOff className="h-4 w-4 text-gray-400" />
                        <span>Ends: {formatDate(recurring.endDate)}</span>
                      </div>
                    )}
                    {recurring.categoryName && (
                      <div className="text-xs text-gray-400">
                        Category: {recurring.categoryName}
                      </div>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-lg ${
                      recurring.isActive 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {recurring.isActive ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          Inactive
                        </>
                      )}
                    </span>
                    {recurring.autoPost && recurring.isActive && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-700">
                        <Zap className="h-3 w-3" />
                        Auto-post
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(recurring.id, recurring.isActive)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        recurring.isActive 
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      }`}
                    >
                      {recurring.isActive ? (
                        <><ToggleRight className="h-4 w-4" /> Deactivate</>
                      ) : (
                        <><ToggleLeft className="h-4 w-4" /> Activate</>
                      )}
                    </button>
                    <button
                      onClick={() => {/* TODO: Open edit modal */}}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(recurring.id)}
                      className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
