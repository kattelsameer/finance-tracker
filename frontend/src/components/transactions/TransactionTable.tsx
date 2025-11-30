import { Edit, Trash2, Tag as TagIcon, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import type { Transaction } from '../../types';

interface TransactionTableProps {
  transactions: Transaction[];
  formatCurrency: (amount: number, currency?: string) => string;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}

export function TransactionTable({ 
  transactions, 
  formatCurrency, 
  onEdit, 
  onDelete 
}: Readonly<TransactionTableProps>) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'INCOME': return <TrendingUp className="h-5 w-5 text-emerald-600" />;
      case 'EXPENSE': return <TrendingDown className="h-5 w-5 text-red-600" />;
      case 'TRANSFER': return <ArrowRightLeft className="h-5 w-5 text-blue-600" />;
      default: return null;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'INCOME': return 'text-emerald-600';
      case 'EXPENSE': return 'text-red-600';
      case 'TRANSFER': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Description</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Account</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getTransactionIcon(transaction.transactionType)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(transaction.transactionDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">{transaction.transactionType}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-gray-900">{transaction.description || '-'}</p>
                {transaction.tags && transaction.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <TagIcon className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {transaction.tags.map(tag => typeof tag === 'string' ? tag : tag.tagName).join(', ')}
                    </span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600">{transaction.categoryName || '-'}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-600">{transaction.accountName}</span>
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${getTransactionColor(transaction.transactionType)}`}>
                {transaction.transactionType === 'EXPENSE' ? '-' : ''}
                {formatCurrency(transaction.amount, transaction.currency)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
