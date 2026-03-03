import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { transactionService } from '../services/transaction.service';
import { accountService } from '../services/account.service';
import { categoryService } from '../services/category.service';
import { useAuth } from '../contexts/AuthContext';
import type { Transaction, Account, Category, TransactionFilter, CreateTransactionRequest, PageResponse } from '../types';
import { logger } from '../utils/logger';
import { formatCurrency as formatCurrencyUtil } from '../utils/formatters';
import {
  Plus,
  Search,
  Filter,
  AlertCircle,
  X,
  FileText
} from 'lucide-react';
import {
  TransactionTable,
  TransactionFilters,
  TransactionForm,
  TransactionPagination
} from '../components/transactions';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export function TransactionsPage() {
  const { user } = useAuth();
  const defaultCurrency = user?.defaultCurrency || 'NPR';
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });
  
  const [filter, setFilter] = useState<TransactionFilter>({
    page: 0,
    size: 10
  });

  // Debounce search term to avoid firing API on every keystroke
  const debouncedSearchTerm = useDebounce(filter.searchTerm, 300);
  const debouncedFilter = useMemo(
    () => ({ ...filter, searchTerm: debouncedSearchTerm }),
    [filter, debouncedSearchTerm]
  );

  const [formData, setFormData] = useState<CreateTransactionRequest>({
    accountId: 0,
    transactionType: 'EXPENSE',
    amount: 0,
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    categoryId: undefined,
    tagIds: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response: PageResponse<Transaction> = await transactionService.getAll(debouncedFilter);
      setTransactions(response.content);
      setPagination({
        page: response.number,
        totalPages: response.totalPages,
        totalElements: response.totalElements
      });
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [debouncedFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const fetchData = async () => {
    try {
      const [accountsData, categoriesData] = await Promise.all([
        accountService.getAll(),
        categoryService.getAll(),
      ]);
      setAccounts(accountsData);
      setCategories(categoriesData);
    } catch (err) {
      logger.error('Failed to fetch data:', err);
    }
  };

  const handleSubmit = async (data: CreateTransactionRequest) => {
    setModalError(null);
    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, data);
      } else {
        await transactionService.create(data);
      }
      setShowModal(false);
      setEditingTransaction(null);
      resetForm();
      fetchTransactions();
    } catch (err) {
      const apiErr = err as Error & { fieldErrors?: Array<{ field: string; message: string }> };
      const fieldErrors = apiErr.fieldErrors;
      if (fieldErrors && fieldErrors.length > 0) {
        const fieldLabels: Record<string, string> = {
          accountId: 'Account', transactionType: 'Transaction Type', amount: 'Amount',
          transactionDate: 'Date', description: 'Description', categoryId: 'Category',
          notes: 'Notes', referenceNumber: 'Reference Number', transferToAccountId: 'Transfer To Account',
        };
        setModalError(fieldErrors.map(fe => `${fieldLabels[fe.field] ?? fe.field}: ${fe.message}`).join(' • '));
      } else {
        setModalError(apiErr.message || 'Failed to save transaction. Please check your inputs.');
      }
    }
  };

  const formatCurrency = (amount: number, currency: string = defaultCurrency) => formatCurrencyUtil(amount, currency);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const handleDelete = async (id: number) => {
    setDeleteConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.id === null) return;
    try {
      await transactionService.delete(deleteConfirm.id);
      fetchTransactions();
    } catch (err) {
      setError((err as Error).message || 'Failed to delete transaction');
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      accountId: transaction.accountId,
      transactionType: transaction.transactionType,
      amount: transaction.amount,
      transactionDate: transaction.transactionDate.split('T')[0],
      description: transaction.description || '',
      categoryId: transaction.categoryId,
      notes: transaction.notes,
      referenceNumber: transaction.referenceNumber,
      tagIds: []
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      accountId: accounts[0]?.id || 0,
      transactionType: 'EXPENSE',
      amount: 0,
      transactionDate: new Date().toISOString().split('T')[0],
      description: '',
      categoryId: undefined,
      tagIds: []
    });
  };

  const openNewModal = () => {
    setEditingTransaction(null);
    setModalError(null);
    resetForm();
    if (accounts.length > 0) {
      setFormData(prev => ({ ...prev, accountId: accounts[0].id }));
    }
    setShowModal(true);
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
        <p className="mt-4 text-gray-500">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8 pb-12">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={filter.searchTerm || ''}
                onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value, page: 0 })}
                className="w-full sm:w-80 pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl border transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              aria-label="Toggle filters"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={openNewModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
          >
            <Plus className="h-5 w-5" />
            Add Transaction
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <TransactionFilters
            filter={filter}
            accounts={accounts}
            onFilterChange={setFilter}
            onClearFilters={() => setFilter({ page: 0, size: 10 })}
          />
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-5">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-600 mb-2">No transactions found</p>
              <p className="text-gray-400 mb-6">Start by adding your first transaction</p>
              <button
                onClick={openNewModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Transaction
              </button>
            </div>
          ) : (
            <>
              <TransactionTable
                transactions={transactions}
                formatCurrency={formatCurrency}
                onEdit={handleEdit}
                onDelete={handleDelete}
                defaultCurrency={defaultCurrency}
              />

              {/* Pagination */}
              <TransactionPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalElements={pagination.totalElements}
                pageSize={10}
                onPageChange={(page) => setFilter({ ...filter, page })}
              />
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <TransactionForm
          formData={formData}
          accounts={accounts}
          categories={categories}
          isEditing={!!editingTransaction}
          serverError={modalError}
          onSubmit={handleSubmit}
          onChange={setFormData}
          onClose={() => { setShowModal(false); setModalError(null); }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
