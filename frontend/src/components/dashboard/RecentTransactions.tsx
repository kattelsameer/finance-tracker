import { Receipt, ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { transactionService } from '../../services/transaction.service';
import type { Transaction } from '../../types';

interface RecentTransactionsProps {
  formatCurrency: (amount: number) => string;
}

export function RecentTransactions({ formatCurrency }: Readonly<RecentTransactionsProps>) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionService.getAll({ page: 0, size: 5 });
      setTransactions(response.content || []);
    } catch (error) {
      console.error('Failed to fetch recent transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[420px] transition-all duration-300 hover:shadow-md">
      <div className="px-6 py-4 bg-purple-600 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500 rounded-md">
            <Receipt className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Recent Transactions</h3>
            <p className="text-sm text-purple-100">Latest 5 activities</p>
          </div>
        </div>
        <Link
          to="/transactions"
          className="text-white hover:text-purple-100 transition-colors"
          title="View all transactions"
        >
          <ExternalLink className="h-5 w-5" />
        </Link>
      </div>
      <div className="p-6 overflow-y-auto scrollbar-hide flex-1 relative">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin border-t-purple-600 mx-auto"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">No transactions yet</p>
            <p className="text-sm text-gray-500">Start adding transactions to see them here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`p-2 rounded-lg ${
                      transaction.transactionType === 'INCOME'
                        ? 'bg-emerald-100'
                        : transaction.transactionType === 'EXPENSE'
                        ? 'bg-red-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    {transaction.transactionType === 'INCOME' ? (
                      <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.transactionDate)} • {transaction.categoryName}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-3">
                  <p
                    className={`text-sm font-bold ${
                      transaction.transactionType === 'INCOME' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.transactionType === 'INCOME' ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
