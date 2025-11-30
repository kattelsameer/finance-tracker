import { Repeat, TrendingUp, TrendingDown, ArrowRightLeft, ToggleLeft, ToggleRight, Edit3, Trash2 } from 'lucide-react';
import type { RecurringTransaction, TransactionType } from '../../types';

interface RecurringListProps {
  transactions: RecurringTransaction[];
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  getFrequencyLabel: (frequency: string) => string;
  onEdit: (transaction: RecurringTransaction) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, currentStatus: boolean) => void;
}

export function RecurringList({ 
  transactions, 
  formatCurrency, 
  formatDate, 
  getFrequencyLabel,
  onEdit, 
  onDelete,
  onToggleActive 
}: RecurringListProps) {
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

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Repeat className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No recurring transactions</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          Set up recurring transactions for regular expenses and income like rent, subscriptions, or paychecks.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {transactions.map((transaction) => {
        const typeConfig = getTransactionTypeConfig(transaction.transactionType);
        const Icon = typeConfig.icon;

        return (
          <div 
            key={transaction.id} 
            className={`bg-white rounded-xl shadow-sm border-2 p-5 transition-all ${
              transaction.isActive ? 'border-gray-200 hover:shadow-md' : 'border-gray-100 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`p-3 rounded-xl ${typeConfig.bg} flex-shrink-0`}>
                  <Icon className={`h-6 w-6 ${typeConfig.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{transaction.description}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeConfig.bg} ${typeConfig.text}`}>
                      {transaction.transactionType}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Repeat className="h-3 w-3" />
                      {getFrequencyLabel(transaction.frequency.frequencyType)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="text-right">
                  <p className={`text-xl font-bold ${typeConfig.amountColor}`}>
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Next: {formatDate(transaction.nextOccurrence)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleActive(transaction.id, transaction.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      transaction.isActive 
                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                    title={transaction.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {transaction.isActive ? (
                      <ToggleRight className="h-5 w-5" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => onEdit(transaction)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
